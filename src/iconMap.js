export const aqiIcon = (index) => {
    let number = null;
    if(index < 50) {
        number = 1;
    }

    if(index > 50 && index <= 100) {
        number = 2;
    }

    if(index > 100 && index <= 150) {
        number = 3;
    }

    if(index > 150 && index <= 200) {
        number = 4;
    }

    if(index > 200 && index <= 300) {
        number = 5;
    }

    if(index > 300) {
        number = 6;
    }

    return `https://waqi.info/images/emoticons/aqi-label-${number}.svg`;
}