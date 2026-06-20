import {loadFont as loadBodyFont} from '@remotion/google-fonts/Inter';
import {loadFont as loadDisplayFont} from '@remotion/google-fonts/LeagueSpartan';

const displayFont = loadDisplayFont('normal', {
	subsets: ['latin'],
	weights: ['600', '700']
});

const bodyFont = loadBodyFont('normal', {
	subsets: ['latin'],
	weights: ['400', '500', '600']
});

export const displayFontFamily = displayFont.fontFamily;
export const bodyFontFamily = bodyFont.fontFamily;
