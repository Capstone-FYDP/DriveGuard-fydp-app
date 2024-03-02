package com.anonymous.fydpapp;
import android.graphics.ImageFormat;
import android.media.Image;

import androidx.camera.core.ImageProxy;

import java.nio.ByteBuffer;

public class YuvFormatDifferentiator {

    public static boolean isI420(Image image) {
        return image.getFormat() == ImageFormat.YUV_420_888 &&
                isPlanesCountValid(image, 3) &&
                isUVPlanar(image);
    }

    public static boolean isNV12(Image image) {
        Image.Plane[] planes = image.getPlanes();
        return image.getFormat() == ImageFormat.YUV_420_888 &&
                isPlanesCountValid(image, 3) &&
                planes[2].getPixelStride() == 2 &&
                isInterleavedWith(planes[2].getBuffer(), planes[1].getBuffer());
    }

    public static boolean isNV21(Image image) {
        Image.Plane[] planes = image.getPlanes();
        return image.getFormat() == ImageFormat.YUV_420_888 &&
                isPlanesCountValid(image, 3) &&
                planes[2].getPixelStride() == 2 &&
                isInterleavedWith(planes[1].getBuffer(), planes[2].getBuffer());
    }

    private static boolean isPlanesCountValid(Image image, int expectedPlanesCount) {
        return image.getPlanes().length == expectedPlanesCount;
    }

    private static boolean isUVPlanar(Image image) {
        Image.Plane[] planes = image.getPlanes();
        return planes[1].getPixelStride() == 1 && planes[2].getPixelStride() == 1;
    }

    private static boolean isInterleavedWith(ByteBuffer og, ByteBuffer other) {
        if (og.get(1) == other.get(0)) {
            byte savePixel = other.get(0);
            byte changed = (byte) ~savePixel;
            try {
                other.put(0, changed); // does changing vBuffer effect uBuffer?
                if (og.get(1) == changed) {
                    return true;
                }
            } catch (Throwable th) {
                // silently catch everything
            } finally {
                other.put(0, savePixel); // restore
            }
        }
        return false;
    }

}
