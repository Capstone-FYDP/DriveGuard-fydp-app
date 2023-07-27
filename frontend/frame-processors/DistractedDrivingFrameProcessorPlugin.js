import { FrameProcessorPlugins, Frame } from 'react-native-vision-camera'

export function toBase64(frame) {
    'worklet';
    // @ts-expect-error because this function is dynamically injected by VisionCamera
    return FrameProcessorPlugins.toBase64(frame);
  }