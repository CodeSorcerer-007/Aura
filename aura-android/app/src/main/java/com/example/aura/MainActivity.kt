package com.example.aura

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.example.aura.theme.AuraTheme
import com.example.aura.ui.main.AuraViewModel
import com.example.aura.ui.main.MainScreen

class MainActivity : ComponentActivity() {

    private val viewModel: AuraViewModel by viewModels()

    private var pendingAttachmentTaskId: Long? = null

    private val pickAttachmentLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        val taskId = pendingAttachmentTaskId
        if (uri != null && taskId != null) {
            viewModel.addAttachmentFromUri(taskId, uri)
        }
        pendingAttachmentTaskId = null
    }

    private val exportBackupLauncher = registerForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                contentResolver.openOutputStream(uri)?.use { output ->
                    output.write(viewModel.exportBackupJson().toByteArray(Charsets.UTF_8))
                }
                viewModel.showToast("Backup exported successfully!", "success")
            } catch (e: Exception) {
                viewModel.showToast("Failed to export backup", "error")
            }
        }
    }

    private val importBackupLauncher = registerForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                contentResolver.openInputStream(uri)?.use { input ->
                    val json = input.bufferedReader(Charsets.UTF_8).readText()
                    viewModel.importBackupJson(json)
                }
            } catch (e: Exception) {
                viewModel.showToast("Failed to import backup", "error")
            }
        }
    }

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        viewModel.toggleNotifications(isGranted)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        // Check and request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        setContent {
            AuraTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black
                ) {
                    MainScreen(
                        viewModel = viewModel,
                        onPickAttachment = { taskId ->
                            pendingAttachmentTaskId = taskId
                            pickAttachmentLauncher.launch("*/*")
                        },
                        onExportBackup = {
                            exportBackupLauncher.launch("aura-backup.json")
                        },
                        onImportBackup = {
                            importBackupLauncher.launch(arrayOf("application/json", "*/*"))
                        }
                    )
                }
            }
        }
    }
}
