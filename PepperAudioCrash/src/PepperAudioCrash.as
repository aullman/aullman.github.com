package
{
	import flash.display.Sprite;
	import flash.media.Video;
	import flash.media.Camera;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.media.Microphone;
	import flash.events.StatusEvent;
	
	[SWF(width='320', height='240', backgroundColor='#000000', frameRate='60')]
	public class PepperAudioCrash extends Sprite
	{
		
		public function PepperAudioCrash():void
		{
			popupAllowBox();
		}
		
		private function popupAllowBox() : void 
		{
			var nc:NetConnection = new NetConnection();
			nc.connect(null);
			var ns:NetStream = new NetStream(nc);
			var mic:Microphone = Microphone.getMicrophone();
			mic.addEventListener(StatusEvent.STATUS, standardSecurityPopupStatusChangeHandler);
			ns.attachAudio(mic);	// This line causes the crash. If you disable the pepper
									// plugin then it doesn't crash.
		}
		
		private function standardSecurityPopupStatusChangeHandler(event:StatusEvent) : void 
		{
			event.currentTarget.removeEventListener(event.type, standardSecurityPopupStatusChangeHandler);
			
			attachVideo();
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