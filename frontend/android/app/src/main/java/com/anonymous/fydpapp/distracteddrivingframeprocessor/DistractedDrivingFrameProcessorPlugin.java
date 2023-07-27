package com.anonymous.fydpapp.distracteddrivingframeprocessor;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Base64;

import androidx.camera.core.ImageProxy;
import com.facebook.react.bridge.WritableNativeArray;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

public class DistractedDrivingFrameProcessorPlugin extends FrameProcessorPlugin {
  @Override
  public Object callback(ImageProxy image, Object[] params) {
    // code goes here
    WritableNativeArray array = new WritableNativeArray();
    ImageProxy.PlaneProxy[] planes = image.getPlanes();
    ByteBuffer yBuffer = planes[0].getBuffer();
    ByteBuffer uBuffer = planes[1].getBuffer();
    ByteBuffer vBuffer = planes[2].getBuffer();

    int ySize = yBuffer.remaining();
    int uSize = uBuffer.remaining();
    int vSize = vBuffer.remaining();

    byte[] nv21 = new byte[ySize + uSize + vSize];
    //U and V are swapped
    yBuffer.get(nv21, 0, ySize);
    vBuffer.get(nv21, ySize, vSize);
    uBuffer.get(nv21, ySize + vSize, uSize);

    YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    yuvImage.compressToJpeg(new Rect(0, 0, yuvImage.getWidth(), yuvImage.getHeight()) , 75, out);

    byte[] imageBytes = out.toByteArray();
    Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);

    //Scale bitmap
    Bitmap scaledImg = scaleCenterCrop(bitmap, 224, 224);

    //Rotate bitmap
    Matrix matrix = new Matrix();
    matrix.postRotate(image.getImageInfo().getRotationDegrees());
    Bitmap rotatedImg = Bitmap.createBitmap(scaledImg, 0, 0, scaledImg.getWidth(), scaledImg.getHeight(), matrix, true);

    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
    rotatedImg.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
    byte[] byteArray = byteArrayOutputStream.toByteArray();

    array.pushString(Base64.encodeToString(byteArray, Base64.DEFAULT));
    return array;
  }

  Bitmap scaleCenterCrop(Bitmap source, int newHeight,
                         int newWidth) {
    int sourceWidth = source.getWidth();
    int sourceHeight = source.getHeight();

    float xScale = (float) newWidth / sourceWidth;
    float yScale = (float) newHeight / sourceHeight;
    float scale = Math.max(xScale, yScale);

    // Now get the size of the source bitmap when scaled
    float scaledWidth = scale * sourceWidth;
    float scaledHeight = scale * sourceHeight;

    float left = (newWidth - scaledWidth) / 2;
    float top = (newHeight - scaledHeight) / 2;

    RectF targetRect = new RectF(left, top, left + scaledWidth, top
            + scaledHeight);//from ww w  .j a va 2s. co m

    Bitmap dest = Bitmap.createBitmap(newWidth, newHeight,
            source.getConfig());
    Canvas canvas = new Canvas(dest);
    canvas.drawBitmap(source, null, targetRect, null);

    return dest;
  }

  public DistractedDrivingFrameProcessorPlugin() {
    super("toBase64");
  }
}