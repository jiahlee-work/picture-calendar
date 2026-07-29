package com.jiahleework.pical.clipboard

import android.content.ClipboardManager
import android.content.Context
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.ByteArrayOutputStream

class PicalClipboardModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "PicalClipboard"

  @ReactMethod
  fun getImageAsync(promise: Promise) {
    try {
      val clipboardManager =
        reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
      val clipData = clipboardManager?.primaryClip

      if (clipData == null || clipData.itemCount == 0) {
        promise.resolve(null)
        return
      }

      for (index in 0 until clipData.itemCount) {
        val item = clipData.getItemAt(index)
        val uri = item.uri

        if (uri == null) {
          continue
        }

        val bitmap = bitmapFromUri(uri)

        if (bitmap == null) {
          continue
        }

        val dataUri = dataUriFromBitmap(bitmap)
        val result = Arguments.createMap().apply {
          putString("data", dataUri)
          putString("fileName", fileNameFromUri(uri))
          putString("mimeType", reactContext.contentResolver.getType(uri) ?: "image/png")
          putString("uri", uri.toString())
        }

        promise.resolve(result)
        return
      }

      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("ERR_PICAL_CLIPBOARD_IMAGE", error)
    }
  }

  private fun bitmapFromUri(uri: Uri): Bitmap? {
    return reactContext.contentResolver.openInputStream(uri)?.use { inputStream ->
      BitmapFactory.decodeStream(inputStream)
    }
  }

  private fun dataUriFromBitmap(bitmap: Bitmap): String {
    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
    val base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)

    return "data:image/png;base64,$base64"
  }

  private fun fileNameFromUri(uri: Uri): String? {
    if (uri.scheme != "content") {
      return uri.lastPathSegment
    }

    return reactContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
      displayNameFromCursor(cursor)
    } ?: uri.lastPathSegment
  }

  private fun displayNameFromCursor(cursor: Cursor): String? {
    val displayNameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)

    if (displayNameIndex < 0 || !cursor.moveToFirst()) {
      return null
    }

    return cursor.getString(displayNameIndex)
  }
}
