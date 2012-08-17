package
{
	import flash.display.Sprite;
	import flash.media.Video;
	import flash.media.Camera;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.media.Microphone;
	import flash.events.StatusEvent;
	import flash.media.MicrophoneEnhancedOptions;
	
	[SWF(width='320', height='240', backgroundColor='#000000', frameRate='60')]
	public class PepperAudioCrash extends Sprite
	{
		
		public function PepperAudioCrash():void
		{
			popupAllowBox();
		}
		
		private function popupAllowBox() : void 
		{
			var mic:Microphone = Microphone.getMicrophone();
			mic.addEventListener(StatusEvent.STATUS, standardSecurityPopupStatusChangeHandler);
			attachMic(mic);
		}
		
		private function standardSecurityPopupStatusChangeHandler(event:StatusEvent) : void 
		{
			event.currentTarget.removeEventListener(event.type, standardSecurityPopupStatusChangeHandler);
			
			var mic:Microphone = Microphone.getEnhancedMicrophone();
			
			var options:MicrophoneEnhancedOptions = new MicrophoneEnhancedOptions();
			options.mode = "fullDuplex";
			options.autoGain = false;
			options.echoPath = 128;
			options.nonLinearProcessing = true;
			mic.enhancedOptions = options;

			trace("Audio enhanced mode = " + mic.enhancedOptions.mode +
			           ", autoGain = " + mic.enhancedOptions.autoGain + 
					   ", echoPath = " + mic.enhancedOptions.echoPath +
			           ", nonLinearProcessing = " + mic.enhancedOptions.nonLinearProcessing);
			
			attachMic(mic);
			
			
			attachVideo();
		}
		
		private function attachMic(mic:Microphone) : void 
		{
			var nc:NetConnection = new NetConnection();
			nc.connect(null);
			var ns:NetStream = new NetStream(nc);
			ns.attachAudio(mic);	
		}
		
		private function attachVideo() : void 
		{
			var video:Video = new Video(320, 240);
			var camera:Camera = Camera.getCamera();
			camera.setMode(320, 240, 12);
			video.attachCamera(camera);
			addChild(video);
		}
		
	}
}