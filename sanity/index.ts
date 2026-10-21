import { headshot } from "./schemas/headshot";
import { speakerProfile } from "./schemas/speakerProfile";
import { speakingEvent } from "./schemas/speakingEvent";
import { talkAbstract } from "./schemas/talkAbstract";

export const schemaTypes = [
	speakerProfile,
	headshot,
	talkAbstract,
	speakingEvent,
];

export { speakerProfile, headshot, talkAbstract, speakingEvent };
export default {
	types: schemaTypes,
};
