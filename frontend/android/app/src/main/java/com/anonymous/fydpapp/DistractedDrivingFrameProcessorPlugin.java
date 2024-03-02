package com.anonymous.fydpapp;

import android.content.Context;
import android.graphics.Bitmap;
import android.media.Image;
import android.util.Base64;
import android.util.Log;


import com.facebook.react.bridge.ReactApplicationContext;
import com.google.android.gms.tflite.client.TfLiteInitializationOptions;
import com.google.android.gms.tflite.gpu.support.TfLiteGpu;
import com.mrousavy.camera.frameprocessor.Frame;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessor.VisionCameraProxy;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.label.Category;
import org.tensorflow.lite.task.core.BaseOptions;
import org.tensorflow.lite.task.gms.vision.TfLiteVision;
import org.tensorflow.lite.task.gms.vision.classifier.Classifications;
import org.tensorflow.lite.task.gms.vision.classifier.ImageClassifier;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.github.crow_misia.libyuv.AbgrBuffer;
import io.github.crow_misia.libyuv.FilterMode;
import io.github.crow_misia.libyuv.RotateMode;
import io.github.crow_misia.libyuv.ext.ImageExt;
import io.github.crow_misia.libyuv.ext.ImageProxyExt;

public class DistractedDrivingFrameProcessorPlugin extends FrameProcessorPlugin {
  ImageClassifier imageClassifier = null;
  final int IMAGE_ROTATION = 270;
  @Override
  public Object callback(@NotNull Frame frame, @Nullable Map<String, Object> params) {
    // code goes here
    Map<String, Object> map = new HashMap<>();
    if (imageClassifier == null) {
      map.put("error", "Error: Image classifier not ready");
      return map;
    }
    Image image = frame.getImage();

    // Determine which type of YUV_420_888 image this is (I420, NV12, NV21) and handle
    // the ImageProxy accordingly. Regardless of which type, convert it to NV21.
    AbgrBuffer abgrBuffer = AbgrBuffer.Factory.allocate(image.getWidth(), image.getHeight());
    
    if (YuvFormatDifferentiator.isI420(image)) {
      ImageExt.toI420Buffer(image).convertTo(abgrBuffer);
    } else if (YuvFormatDifferentiator.isNV12(image)) {
      ImageExt.toNv12Buffer(image).convertTo(abgrBuffer);
    } else if (YuvFormatDifferentiator.isNV21(image)){
      ImageExt.toNv21Buffer(image).convertTo(abgrBuffer);
    } else {
      map.put("error", "Error: Invalid image type");
      return map;
    }

    // Rotate image due to android capture orientation
    int rotatedWidth = IMAGE_ROTATION % 180 == 0 ? image.getWidth() : image.getHeight();
    int rotatedHeight = IMAGE_ROTATION % 180 == 0 ? image.getHeight() : image.getWidth();
    AbgrBuffer abgrBufferRotated = AbgrBuffer.Factory.allocate(rotatedWidth, rotatedHeight);

    abgrBuffer.rotate(abgrBufferRotated, getRotateMode(IMAGE_ROTATION));

    // Scale image to required size for ML model
    final int targetWidth = 224;
    final int targetHeight = 224;
    float xScale = (float) targetWidth / rotatedWidth;
    float yScale = (float) targetHeight / rotatedHeight;
    float scale = Math.max(xScale, yScale);
    int scaledWidth = (int) Math.ceil(scale*rotatedWidth);
    int scaledHeight = (int) Math.ceil(scale*rotatedHeight);
    AbgrBuffer abgrBufferScaled = AbgrBuffer.Factory.allocate(scaledWidth, scaledHeight);

    abgrBufferRotated.scale(abgrBufferScaled, FilterMode.BILINEAR);

    // Crop image to required size for ML model
    Bitmap abgrBitmapScaled = abgrBufferScaled.asBitmap();
    Bitmap abgrBitmapCropped = Bitmap.createBitmap(
      abgrBitmapScaled,
      scaledWidth/2 - targetWidth/2,
      scaledHeight/2 - targetHeight/2,
      targetWidth,
      targetHeight
    );
    abgrBitmapScaled.recycle();

    List<Classifications> classificationsList = imageClassifier.classify(TensorImage.fromBitmap(abgrBitmapCropped));

    if (classificationsList.size() > 0 && classificationsList.get(0).getCategories().size() > 0) {
      Category classification = classificationsList.get(0).getCategories().get(0);
      if (classification.getScore() > 0.7) {
        ByteArrayOutputStream byteArrayStream = new ByteArrayOutputStream();
        abgrBitmapCropped.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayStream);
        byte[] byteArray = byteArrayStream.toByteArray();
  
        map.put("classification", classification.getLabel());
        map.put("score", (double) classification.getScore());
        map.put("base64", Base64.encodeToString(byteArray, Base64.DEFAULT));
      }
    }
    abgrBitmapCropped.recycle();
    return map;

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

  public DistractedDrivingFrameProcessorPlugin(VisionCameraProxy proxy, @Nullable Map<String, Object> options) {
    // Initialize Image classifier
    ReactApplicationContext context = proxy.getContext();
    TfLiteGpu.isGpuDelegateAvailable(context).addOnCompleteListener(gpuTask -> {
      if (gpuTask.isSuccessful()) {
        TfLiteInitializationOptions.Builder tfLiteInitializationOptionsBuilder = TfLiteInitializationOptions.builder();
        if (gpuTask.getResult()) {
          Log.d("DistractedDriving", "Using GPU Delegate for Tensorflow");
          tfLiteInitializationOptionsBuilder.setEnableGpuDelegateSupport(true);
        }
        TfLiteVision.initialize(context, tfLiteInitializationOptionsBuilder.build()).addOnCompleteListener(task -> {
          if (task.isSuccessful()) {
            if (TfLiteVision.isInitialized()) {
              BaseOptions.Builder baseOptionsBuilder = BaseOptions.builder();
              if (gpuTask.getResult()) {
                baseOptionsBuilder = baseOptionsBuilder.useGpu();
              }
              ImageClassifier.ImageClassifierOptions classifierOptions =
                      ImageClassifier.ImageClassifierOptions.builder()
                              .setBaseOptions(baseOptionsBuilder.build())
                              .setMaxResults(1)
                              .build();
              try {
                imageClassifier = ImageClassifier.createFromFileAndOptions(
                        context, "drive_guard_model_int8.tflite", classifierOptions);
              } catch (IOException e) {
                Log.e("DistractedDriving", String.format("Error creating image classifier: %s", e.getMessage()));
              }
            } else {
              Log.e("DistractedDriving", "TfLiteVision not yet initialized");
            }
          } else {
            Log.e("DistractedDriving", String.format("Error initializing TfLiteVision: %s", task.getException().getMessage()));
          }
        });
      } else {
        Log.e("DistractedDriving", String.format("Error checking GPU compatibility: %s", gpuTask.getException().getMessage()));
      }
    });
  }
}