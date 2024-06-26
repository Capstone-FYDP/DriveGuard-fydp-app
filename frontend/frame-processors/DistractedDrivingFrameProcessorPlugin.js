import { VisionCameraProxy, Frame } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.getFrameProcessorPlugin('to_base_64');

export function toBase64(frame) {
    'worklet';
    // @ts-expect-error because this function is dynamically injected by VisionCamera
    if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "example_plugin"!');

    return plugin.call(frame);
  }