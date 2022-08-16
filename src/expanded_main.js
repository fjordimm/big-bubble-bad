"use strict";

const CAMERAZ = 100;
const PLAYERACC = 0.05;
const BUBBLESIZEMULT = 30;

let g_mainMouse;
let g_mainKeyboard;
let g_mainCamera;
let g_player;
let g_playerXVel;
let g_playerYVel;
let g_playerBubble;

runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	runtime.addEventListener("tick", () => Tick(runtime));

	g_mainMouse = runtime.objects.MainMouse;
	g_mainKeyboard = runtime.objects.MainKeyboard;
	g_mainCamera = runtime.objects.MainCamera;
	g_player = runtime.objects.Player.getFirstInstance();
	g_playerXVel = 0;
	g_playerYVel = 0;
	g_playerBubble = runtime.objects.Bubble.createInstance(0, 0, 0);
	g_playerBubble.bubbleSize = 2;
	
	g_player.x = 0;
	g_player.y = 0;
}

function Tick(runtime)
{
	g_mainCamera.lookAtPosition(g_player.x, g_player.y, CAMERAZ, g_player.x, g_player.y, 0, 0, 1, 0);
	
	g_player.x += g_playerXVel;
	g_player.y += g_playerYVel;
	
	g_playerBubble.x = g_player.x;
	g_playerBubble.y = g_player.y;
	
	let allBubbles = runtime.objects.Bubble.getAllInstances();
	for (let i = 0; i < allBubbles.length; i++)
	{
		allBubbles[i].width = BUBBLESIZEMULT * allBubbles[i].bubbleSize;
		allBubbles[i].height = BUBBLESIZEMULT * allBubbles[i].bubbleSize;
	}
	
	if (g_mainMouse.isMouseButtonDown(0))
	{
		const mouseX = g_mainMouse.getMouseX();
		const mouseY = g_mainMouse.getMouseY();
	
		const xDisp = mouseX - g_player.x;
		const yDisp = mouseY - g_player.y;
		const angle = Math.atan(yDisp / xDisp);
		const thingus = (Math.sign(xDisp) == -1) ? Math.PI : 0;
		const xDelta = Math.cos(angle + thingus);
		const yDelta = Math.sin(angle + thingus);

		g_playerXVel += xDelta * -PLAYERACC;
		g_playerYVel += yDelta * -PLAYERACC;
		
		miniBub = runtime.objects.Bubble.createInstance(0, g_player.x, g_player.y);
		miniBub.bubbleSize = 3;
		miniBub.bubbleSize = 2;
		miniBub.bubbleSize = 1;
	}

}
