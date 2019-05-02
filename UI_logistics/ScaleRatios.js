import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const xrWidth = 414;
const xrHeight = 896;

const scaleWidth = width/xrWidth;
const scaleHeight = height/xrHeight;

const scaleToUse = Math.min(scaleWidth, scaleHeight);

export function scale(size) {
    return Math.ceil((size * scaleToUse))
}
    