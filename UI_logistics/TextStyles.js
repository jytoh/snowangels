import {scale} from './ScaleRatios'

/*
* User this to easily standardize and change fonts throughout
* the app. Just upload the fonts into assets and define them 
* here. In each component, you can just import 
* txt from '../UI_logistics/TextStyles' and call these sizes and 
* fonts through txt.small, txt.bold, etc.
*/
const txt = {
        small: scale(20),
        button: scale(22),
        large: scale(40),
        header: scale(30),

        bold: 'Cabin-Bold',
        reg: 'Cabin-Regular'
    };

export default txt;