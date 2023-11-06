package com.anonymous.fydpapp.distracteddrivingframeprocessor;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.YuvImage;
import android.media.ThumbnailUtils;
import android.util.Base64;

import androidx.camera.core.ImageProxy;
import androidx.camera.core.internal.utils.ImageUtil;

import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.mrousavy.camera.frameprocessor.Frame;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

import javax.annotation.Nullable;

import io.github.crow_misia.libyuv.AbgrBuffer;
import io.github.crow_misia.libyuv.FilterMode;
import io.github.crow_misia.libyuv.I420Buffer;
import io.github.crow_misia.libyuv.Nv21Buffer;
import io.github.crow_misia.libyuv.RotateMode;
import io.github.crow_misia.libyuv.ext.ImageProxyExt;

public class DistractedDrivingFrameProcessorPlugin extends FrameProcessorPlugin {
  @Override
  public Object callback(@Nullable Frame frame, @Nullable ReadableNativeMap params) {
    // code goes here
    WritableNativeArray array = new WritableNativeArray();
    if (frame == null) {
      array.pushString("Error: Null frame");
      return array;
    }
    ImageProxy image = frame.getImageProxy();

    // Determine which type of YUV_420_888 image this is (I420, NV12, NV21) and handle
    // the ImageProxy accordingly. Regardless of which type, convert it to NV21.
    Nv21Buffer nv21Buffer;
    if (YuvFormatDifferentiator.isI420(image)) {
      nv21Buffer = Nv21Buffer.Factory.allocate(image.getWidth(), image.getHeight());
      ImageProxyExt.toI420Buffer(image).convertTo(nv21Buffer);
    } else if (YuvFormatDifferentiator.isNV12(image)) {
      nv21Buffer = Nv21Buffer.Factory.allocate(image.getWidth(), image.getHeight());
      ImageProxyExt.toNv12Buffer(image).convertTo(nv21Buffer);
    } else if (YuvFormatDifferentiator.isNV21(image)){
      nv21Buffer = ImageProxyExt.toNv21Buffer(image);
    } else {
      array.pushString("Error: Invalid image type");
      return array;
    }

    // Rotate image due to android capture orientation
    int imageRotation = image.getImageInfo().getRotationDegrees();
    int rotatedWidth = imageRotation % 180 == 0 ? image.getWidth() : image.getHeight();
    int rotatedHeight = imageRotation % 180 == 0 ? image.getHeight() : image.getWidth();
    Nv21Buffer nv21BufferRotated = Nv21Buffer.Factory.allocate(rotatedWidth, rotatedHeight);

    nv21Buffer.rotate(nv21BufferRotated, getRotateMode(image.getImageInfo().getRotationDegrees()));

    // Scale image to required size for ML model
    final int targetWidth = 224;
    final int targetHeight = 224;
    float xScale = (float) targetWidth / rotatedWidth;
    float yScale = (float) targetHeight / rotatedHeight;
    float scale = Math.max(xScale, yScale);
    int scaledWidth = (int)(scale*rotatedWidth);
    int scaledHeight = (int)(scale*rotatedHeight);
    Nv21Buffer nv21BufferScaled = Nv21Buffer.Factory.allocate(scaledWidth, scaledHeight);

    nv21BufferRotated.scale(nv21BufferScaled, FilterMode.BILINEAR);

    // Convert to a YUV Image and compress to JPEG
    YuvImage yuvImage = new YuvImage(nv21BufferScaled.asByteArray(), ImageFormat.NV21, scaledWidth, scaledHeight, null);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    yuvImage.compressToJpeg(new Rect((yuvImage.getWidth()/2) - (targetWidth/2), (yuvImage.getHeight()/2) - (targetHeight/2), (yuvImage.getWidth()/2) + (targetWidth/2), (yuvImage.getHeight()/2) + (targetHeight/2)) , 100, out);

    byte[] byteArray = out.toByteArray();

    array.pushNull();
    array.pushString(Base64.encodeToString(byteArray, Base64.DEFAULT));
    return array;
  }

  RotateMode getRotateMode(int rotationDegrees) {
    switch(rotationDegrees) {
      case 90:
        return RotateMode.ROTATE_90;
      case 180:
        return RotateMode.ROTATE_180;
      case 270:
        return RotateMode.ROTATE_270;
      default:
        return RotateMode.ROTATE_0;
    }
  }

  public DistractedDrivingFrameProcessorPlugin() {}
}