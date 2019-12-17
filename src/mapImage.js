var BASE_URL = 'https://maps.googleapis.com/maps/api/';

export const mapImage = ( opts ) => {
    opts.key = 'AIzaSyDc2kjzGKdlW79ZS24i67odMvByCkLwff4'
	opts.zoom = typeof opts.zoom === 'number' ? opts.zoom : 14;
	opts.size = opts.size || '320x240';

	if( opts.type == 'staticmap' ) {

		if( opts.center === undefined ) {

			throw new Error( 'center must be defined in options' );
		} else if( opts.type === undefined ) {

			throw new Error( 'type must be defined in options' );
		}
	} else if( opts.type == 'streetview' ) {

		if( opts.location === undefined && opts.pano === undefined ) {

			throw new Error( 'you must pass in location in options' );
		}
	} else {

		throw new Error( opts.type + ' is an invalid type. Use "staticmap" or "streetview".' );
	}

    
    const optString = [];
    Object.keys(opts).forEach((item,index)=>{

        optString.push(`${item}=${opts[item]}`)
        if(index !== Object.keys(opts).length - 1){
            optString.push('&')
        }
    })
    console.log(optString.join(''))
	return BASE_URL + opts.type + '?' + optString.join('') ;
};