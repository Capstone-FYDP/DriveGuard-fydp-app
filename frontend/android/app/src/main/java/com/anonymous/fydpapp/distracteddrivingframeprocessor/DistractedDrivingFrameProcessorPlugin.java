package com.anonymous.fydpapp.distracteddrivingframeprocessor;

import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.tflite.client.TfLiteInitializationOptions;
import com.google.android.gms.tflite.gpu.support.TfLiteGpu;
import com.mrousavy.camera.frameprocessor.Frame;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.label.Category;
import org.tensorflow.lite.task.core.BaseOptions;
import org.tensorflow.lite.task.gms.vision.TfLiteVision;
import org.tensorflow.lite.task.gms.vision.classifier.Classifications;
import org.tensorflow.lite.task.gms.vision.classifier.ImageClassifier;

import java.io.IOException;
import java.util.List;

import javax.annotation.Nullable;

import io.github.crow_misia.libyuv.AbgrBuffer;
import io.github.crow_misia.libyuv.FilterMode;
import io.github.crow_misia.libyuv.RotateMode;
import io.github.crow_misia.libyuv.ext.ImageProxyExt;

public class DistractedDrivingFrameProcessorPlugin extends FrameProcessorPlugin {
  ImageClassifier imageClassifier = null;
  @Override
  public Object callback(@Nullable Frame frame, @Nullable ReadableNativeMap params) {
    // code goes here
    WritableNativeArray array = new WritableNativeArray();
    if (frame == null) {
      array.pushString("Error: Null frame");
      return array;
    }
    if (imageClassifier == null) {
      array.pushString("Error: Image classifier not ready");
      return array;
    }
    ImageProxy image = frame.getImageProxy();

    // Determine which type of YUV_420_888 image this is (I420, NV12, NV21) and handle
    // the ImageProxy accordingly. Regardless of which type, convert it to NV21.
    AbgrBuffer abgrBuffer = AbgrBuffer.Factory.allocate(image.getWidth(), image.getHeight());
    
    if (YuvFormatDifferentiator.isI420(image)) {
      ImageProxyExt.toI420Buffer(image).convertTo(abgrBuffer);
    } else if (YuvFormatDifferentiator.isNV12(image)) {
      ImageProxyExt.toNv12Buffer(image).convertTo(abgrBuffer);
    } else if (YuvFormatDifferentiator.isNV21(image)){
      ImageProxyExt.toNv21Buffer(image).convertTo(abgrBuffer);
    } else {
      array.pushString("Error: Invalid image type");
      return array;
    }

    // Rotate image due to android capture orientation
    int imageRotation = image.getImageInfo().getRotationDegrees();
    int rotatedWidth = imageRotation % 180 == 0 ? image.getWidth() : image.getHeight();
    int rotatedHeight = imageRotation % 180 == 0 ? image.getHeight() : image.getWidth();
    AbgrBuffer abgrBufferRotated = AbgrBuffer.Factory.allocate(rotatedWidth, rotatedHeight);

    abgrBuffer.rotate(abgrBufferRotated, getRotateMode(image.getImageInfo().getRotationDegrees()));

    // Scale image to required size for ML model
    final int targetWidth = 224;
    final int targetHeight = 224;
    float xScale = (float) targetWidth / rotatedWidth;
    float yScale = (float) targetHeight / rotatedHeight;
    float scale = Math.max(xScale, yScale);
    int scaledWidth = (int)(scale*rotatedWidth);
    int scaledHeight = (int)(scale*rotatedHeight);
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
//    for (Classifications classifications : classificationsList) {
//      Log.d("DistractedDriving", "classification:");
//      for (Category category : classifications.getCategories()) {
//        Log.d("DistractedDriving", String.format("class: %s, score: %f", category.getDisplayName(), category.getScore()));
//      }
//    }
    abgrBitmapCropped.recycle();

    array.pushNull();
    if (classificationsList.size() > 0 && classificationsList.get(0).getCategories().size() > 0) {
      Category classification = classificationsList.get(0).getCategories().get(0);
      array.pushString(classification.getLabel());
      array.pushDouble(classification.getScore());
    } else {
      array.pushNull();
    }
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

  public DistractedDrivingFrameProcessorPlugin(Context context) {
    // Initialize Image classifier
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
              ImageClassifier.ImageClassifierOptions options =
                      ImageClassifier.ImageClassifierOptions.builder()
                              .setBaseOptions(baseOptionsBuilder.build())
                              .setMaxResults(1)
                              .build();
              try {
                imageClassifier = ImageClassifier.createFromFileAndOptions(
                        context, "drive_guard_model_int8.tflite", options);
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