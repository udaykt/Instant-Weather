// heroAnimation.ts — time-of-day background gradient for the landing page
import { getDaytimePhase } from '@/shared/utils/weatherUtils';

document.body.style.backgroundImage = getDaytimePhase(new Date().getHours()).gradient;
