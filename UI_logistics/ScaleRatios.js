import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const xrWidth = 414;
const xrHeight = 896;

const scaleWidth = width/xrWidth;
const scaleHeight = height/xrHeight;

const scaleToUse = Math.min(scaleWidth, scaleHeight);


/*
* Use with every numerical sizing/positioning to make sure
* that components are standardized across all phone sizes
*/
export function scale(size) {
    return Math.ceil((size * scaleToUse))
}
    