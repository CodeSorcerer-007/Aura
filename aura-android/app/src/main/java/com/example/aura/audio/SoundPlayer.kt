package com.example.aura.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Random
import kotlin.math.sin

object SoundPlayer {

    private const val SAMPLE_RATE = 44100
    private var noiseJob: Job? = null
    private var noiseTrack: AudioTrack? = null

    fun playTone(frequency: Double, durationMs: Int, volume: Float = 0.3f, isPluck: Boolean = false) {
        Thread {
            try {
                val numSamples = (durationMs * SAMPLE_RATE) / 1000
                val buffer = ShortArray(numSamples)

                for (i in 0 until numSamples) {
                    val time = i.toDouble() / SAMPLE_RATE
                    val envelope = if (isPluck) {
                        (1.0 - (i.toDouble() / numSamples))
                    } else {
                        // Smooth attack and release
                        val attack = (i.toDouble() / (SAMPLE_RATE * 0.02)).coerceAtMost(1.0)
                        val release = ((numSamples - i).toDouble() / (SAMPLE_RATE * 0.04)).coerceIn(0.0, 1.0)
                        attack * release
                    }
                    val sample = sin(2.0 * Math.PI * frequency * time) * envelope * volume
                    buffer[i] = (sample * Short.MAX_VALUE).toInt().toShort()
                }

                val audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(SAMPLE_RATE)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(buffer.size * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                audioTrack.write(buffer, 0, buffer.size)
                audioTrack.play()
                Thread.sleep(durationMs.toLong() + 50)
                audioTrack.release()
            } catch (_: Exception) {}
        }.start()
    }

    fun playAddSound() {
        playTone(523.25, 150, 0.25f) // C5
    }

    fun playCompleteSound() {
        playTone(1318.51, 180, 0.25f) // E6
    }

    fun playAchievementSound() {
        playTone(2093.00, 350, 0.3f, isPluck = true) // C7 chime
    }

    @Synchronized
    fun startNoise(type: String, scope: CoroutineScope) {
        stopNoise()
        if (type == "off") return

        val bufferSize = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        ) * 2

        val track = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(bufferSize)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        noiseTrack = track
        track.play()

        noiseJob = scope.launch(Dispatchers.Default) {
            val random = Random()
            val chunk = ShortArray(1024)

            // Pink noise filter state
            var b0 = 0.0
            var b1 = 0.0
            var b2 = 0.0
            var b3 = 0.0
            var b4 = 0.0
            var b5 = 0.0
            var b6 = 0.0

            // Brown noise filter state
            var lastBrown = 0.0

            while (isActive) {
                for (i in chunk.indices) {
                    val white = (random.nextDouble() * 2.0 - 1.0)
                    val sample = when (type) {
                        "pink" -> {
                            b0 = 0.99886 * b0 + white * 0.0555179
                            b1 = 0.99332 * b1 + white * 0.0750759
                            b2 = 0.96900 * b2 + white * 0.1538520
                            b3 = 0.86650 * b3 + white * 0.3104856
                            b4 = 0.55000 * b4 + white * 0.5329522
                            b5 = -0.7616 * b5 - white * 0.0168980
                            val pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
                            b6 = white * 0.115926
                            pink
                        }
                        "brown" -> {
                            lastBrown = (lastBrown + (0.02 * white)) / 1.02
                            lastBrown * 3.5
                        }
                        else -> { // white
                            white * 0.25
                        }
                    }
                    val clamped = sample.coerceIn(-1.0, 1.0) * 0.15 // Gentle background level
                    chunk[i] = (clamped * Short.MAX_VALUE).toInt().toShort()
                }
                track.write(chunk, 0, chunk.size)
            }
        }
    }

    @Synchronized
    fun stopNoise() {
        noiseJob?.cancel()
        noiseJob = null
        noiseTrack?.let {
            try {
                it.stop()
                it.release()
            } catch (_: Exception) {}
        }
        noiseTrack = null
    }
}
