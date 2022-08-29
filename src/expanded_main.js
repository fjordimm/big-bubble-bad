"use strict";

const GAMELAYER = 0;
const TITLELAYER = 1;
const CAMERAZ = 200;

const PLAYERACC = 0.0004;

const BUBBLESHOOTERACC = 3.7;
const BUBBLESHOOTINCR = 90;
const BUBBLESHOOTRANDMULT = 0.3;
const BUBBLESHOOTRANDSCALE = 0.3;
const BUBBLESHOOTDESTROYDELAY = 100;
const BUBBLESIZEMULT = 20;

const ASTEROIDGENRENDDIST = 5;
const ASTEROIDGENSPACING = 700;
const ASTEROIDGENRANDOFFSET = 370;
const ASTEROIDMAXSIZE = 300;
const ASTEROIDMINSIZE = 100;

const ANIMALGENRENDDIST = 5;
const ANIMALGENSPACING = 900;
const ANIMALGENRANDOFFSET = 900;
const ANIMALSIZE = 100;
const ANIMALMAXVEL = 0.8;
const ANIMALMAXROTVEL = 0.04;
const CAPTUREDANIMALRANDSPEED = 1.5;

const BUBBLEFILLDELTA = 0.1;
const MINPLAYERBUBBLESIZE = 7;

const ANIMALCOUNTTOWIN = 10;

let g_mainMouse;
let g_mainKeyboard;
let g_mainCamera;
let g_mainBackground;
let g_player;
let g_playerBubble;
let g_ship;
let g_button;

let g_asteroidDict = {};
let g_animalDict = {};

let g_winDisplay;
let g_dieDisplay;
let g_titleDisplay;

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
	g_mainBackground = runtime.objects.MainBackground.getFirstInstance();
	g_player = runtime.objects.Player.getFirstInstance();
	g_player.g_xVel = 0;
	g_player.g_yVel = 0;
	g_playerBubble = runtime.objects.Bubble.createInstance(GAMELAYER, 0, 0);
	g_playerBubble.g_bubbleSize = 0;
	g_playerBubble.g_bubbleType = "playerBub";
	g_ship = runtime.objects.Ship.getFirstInstance();
	g_button = runtime.objects.Button.getFirstInstance();
	g_winDisplay = runtime.objects.WinDisplay.getFirstInstance();
	g_dieDisplay = runtime.objects.DieDisplay.getFirstInstance();
	g_titleDisplay = runtime.objects.TitleDisplay.getFirstInstance();
	
	g_player.x = 0;
	g_player.y = 0;

	runtime.layout.getLayer(TITLELAYER).isVisible = false;
	runtime.layout.getLayer(GAMELAYER).isVisible = true;
}

let isPaused = false;
let totalAnimalsCollected = 0;
let Tick_alreadyAtShip = true;
let Tick_clickAlreadyDown = false;
let Tick_counter = 0;
function Tick(runtime)
{
	if (!isPaused)
	{
		Tick_counter++;

		if (Tick_counter % 20 <= 10)
		{
			g_button.setAnimation("0");
		}
		else
		{
			g_button.setAnimation("1");
		}
		
		if (g_mainMouse.isMouseButtonDown(0))
		{
			g_titleDisplay.isVisible = false;
			const mouseIsOverButton = g_mainMouse.getMouseX() > g_button.x - g_button.width / 2 && g_mainMouse.getMouseX() < g_button.x + g_button.width / 2 && g_mainMouse.getMouseY() > g_button.y - g_button.height / 2 && g_mainMouse.getMouseY() < g_button.y + g_button.height / 2;

			if (mouseIsOverButton && g_player.testOverlap(g_ship))
			{
				if (g_playerBubble.g_bubbleSize < MINPLAYERBUBBLESIZE)
				{ g_playerBubble.g_bubbleSize = MINPLAYERBUBBLESIZE; }
				else
				{ g_playerBubble.g_bubbleSize += BUBBLEFILLDELTA; g_playerBubble.isVisible = true; }
			}
			else if (g_playerBubble.g_bubbleSize >= MINPLAYERBUBBLESIZE)
			{
				const mouseX = g_mainMouse.getMouseX();
				const mouseY = g_mainMouse.getMouseY();
			
				const xDisp = mouseX - g_player.x;
				const yDisp = mouseY - g_player.y;
				const distToMouse = Math.sqrt(Math.pow(xDisp, 2) + Math.pow(yDisp, 2));
				const angle = Math.atan(yDisp / xDisp);
				const thingus = (Math.sign(xDisp) == -1) ? Math.PI : 0;
				const xDelta = -Math.cos(angle + thingus);
				const yDelta = -Math.sin(angle + thingus);

				g_player.g_xVel += xDelta * PLAYERACC * distToMouse;
				g_player.g_yVel += yDelta * PLAYERACC * distToMouse;
				
				if (Tick_counter % Math.floor(BUBBLESHOOTINCR / Math.sqrt(distToMouse)) == 0)
				{
					const shotBubble = runtime.objects.Bubble.createInstance(GAMELAYER, g_player.x, g_player.y);
					shotBubble.g_bubbleSize = 1;
					shotBubble.g_bubbleType = "shotBub";
					shotBubble.g_popTime = BUBBLESHOOTDESTROYDELAY;

					const finalBubbleShootRand = BUBBLESHOOTRANDMULT * Math.exp(-BUBBLESHOOTRANDSCALE * (g_player.g_xVel * xDelta + g_player.g_yVel * yDelta));
					const angleMB = angle + Math.random() * finalBubbleShootRand - 0.5 * finalBubbleShootRand;
					const thingusMB = (Math.sign(xDisp) == -1) ? Math.PI : 0;
					const xDeltaMB = -Math.cos(angleMB + thingusMB);
					const yDeltaMB = -Math.sin(angleMB + thingusMB);

					shotBubble.g_xVel = -xDeltaMB * BUBBLESHOOTERACC + g_player.g_xVel;
					shotBubble.g_yVel = -yDeltaMB * BUBBLESHOOTERACC + g_player.g_yVel;

					if (g_playerBubble.g_bubbleSize > MINPLAYERBUBBLESIZE)
					{ g_playerBubble.g_bubbleSize -= 0.05; }
				}
			}
			else
			{
				
				if (g_playerBubble.isVisible)
				{
					const popAnimationBubble = runtime.objects.Bubble.createInstance(GAMELAYER, g_playerBubble.x, g_playerBubble.y - 100);
					popAnimationBubble.g_bubbleSize = g_playerBubble.g_bubbleSize;
					popAnimationBubble.g_bubbleType = "shotBub";
					popAnimationBubble.g_popTime = 30;
					popAnimationBubble.setAnimation("popping");
					popAnimationBubble.g_xVel = g_player.g_xVel;
					popAnimationBubble.g_yVel = g_player.g_yVel;
				}

				g_playerBubble.isVisible = false;
			}

			if (!Tick_clickAlreadyDown)
			{
				Tick_clickAlreadyDown = true;
			}
		}
		else
		{
			Tick_clickAlreadyDown = false;
		}

		if (g_player.testOverlap(g_ship) && g_playerBubble.g_bubbleSize < MINPLAYERBUBBLESIZE)
		{
			g_player.g_xVel *= 0.9;
			g_player.g_yVel *= 0.9;
		}

		g_player.x += g_player.g_xVel;
		g_player.y += g_player.g_yVel;

		{
			const allBubbles = runtime.objects.Bubble.getAllInstances();
			for (let i = 0; i < allBubbles.length; i++)
			{
				allBubbles[i].width = BUBBLESIZEMULT * allBubbles[i].g_bubbleSize;
				allBubbles[i].height = BUBBLESIZEMULT * allBubbles[i].g_bubbleSize;
				
				allBubbles[i].x += allBubbles[i].g_xVel;
				allBubbles[i].y += allBubbles[i].g_yVel;

				if (allBubbles[i].g_bubbleType === "shotBub")
				{
					allBubbles[i].g_popTime--;
					if (allBubbles[i].g_popTime <= 0)
					{ allBubbles[i].destroy(); }
				}
			}
		}

		let eeecapturedAnimalCount = 0;
		{
			const allAnimals = runtime.objects.Animal.getAllInstances();
			for (let i = 0; i < allAnimals.length; i++)
			{
				if (allAnimals[i].g_isCaptured)
				{
					eeecapturedAnimalCount++;
				}
			}
		}

		const allAnimals = runtime.objects.Animal.getAllInstances();
		for (let i = 0; i < allAnimals.length; i++)
		{
			if (allAnimals[i].g_isCaptured)
			{
				let dist = Math.sqrt(Math.pow(g_playerBubble.x - allAnimals[i].x, 2) + Math.pow(g_playerBubble.y - allAnimals[i].y, 2));
				if (dist > 0.1 + Math.min(g_playerBubble.width, g_playerBubble.height) / 2 - Math.min(allAnimals[i].width, allAnimals[i].height) / 2)
				{
					allAnimals[i].g_bubRelX -= allAnimals[i].g_bubRelVelX * 2;
					allAnimals[i].g_bubRelY -= allAnimals[i].g_bubRelVelY * 2;
				}
				if (dist > Math.min(g_playerBubble.width, g_playerBubble.height) / 2 - Math.min(allAnimals[i].width, allAnimals[i].height) / 2)
				{
					allAnimals[i].g_bubRelVelX *= -1;
					allAnimals[i].g_bubRelVelY *= -1;
				}
				
				allAnimals[i].g_bubRelX += allAnimals[i].g_bubRelVelX;
				allAnimals[i].g_bubRelY += allAnimals[i].g_bubRelVelY;

				allAnimals[i].x = g_playerBubble.x + allAnimals[i].g_bubRelX;
				allAnimals[i].y = g_playerBubble.y + allAnimals[i].g_bubRelY;
			}
			else
			{
				allAnimals[i].x += allAnimals[i].g_xVel;
				allAnimals[i].y += allAnimals[i].g_yVel;
				allAnimals[i].angle += allAnimals[i].g_rotVel;

				if (allAnimals[i].testOverlap(g_playerBubble))
				{
					if (eeecapturedAnimalCount < (g_playerBubble.g_bubbleSize - MINPLAYERBUBBLESIZE) / 3)
					{
						allAnimals[i].g_isCaptured = true;
						allAnimals[i].g_bubRelX = 0;
						allAnimals[i].g_bubRelY = 0;
						allAnimals[i].g_bubRelVelX = Math.random() * CAPTUREDANIMALRANDSPEED - 0.5 * CAPTUREDANIMALRANDSPEED;
						allAnimals[i].g_bubRelVelY = Math.random() * CAPTUREDANIMALRANDSPEED - 0.5 * CAPTUREDANIMALRANDSPEED;
					}
				}

				if (allAnimals[i].testOverlap(g_ship))
				{
					allAnimals[i].g_xVel *= -1;
					allAnimals[i].g_yVel *= -1;
				}
			}
		}

		const allAsteroids = runtime.objects.Asteroid.getAllInstances();
		for (let i = 0; i < allAsteroids.length; i++)
		{		
			if (allAsteroids[i].testOverlap(g_playerBubble) || allAsteroids[i].testOverlap(g_player))
			{
				runtime.layout.getLayer(TITLELAYER).isVisible = true;
				runtime.layout.getLayer(GAMELAYER).isVisible = false;

				g_dieDisplay.isVisible = true;
				g_winDisplay.isVisible = false;

				g_mainCamera.lookAtPosition(0, 0, CAMERAZ, 0, 0, 0, 0, 1, 0);
				isPaused = true;
			}
		}

		for (let c = -ASTEROIDGENRENDDIST; c < ASTEROIDGENRENDDIST; c++)
		{
			for (let r = -ASTEROIDGENRENDDIST; r < ASTEROIDGENRENDDIST; r++)
			{
				const asteroidX = Math.floor(g_player.x / ASTEROIDGENSPACING + c);
				const asteroidY = Math.floor(g_player.y / ASTEROIDGENSPACING + r);
				if (((asteroidX < -1) || (asteroidX > 1) || (asteroidY < -1) || (asteroidY > 1)) && !([asteroidX, asteroidY] in g_asteroidDict))
				{
					g_asteroidDict[[asteroidX, asteroidY]] = true;

					const randOffsetX = Math.random() * ASTEROIDGENRANDOFFSET - 0.5 * ASTEROIDGENRANDOFFSET;
					const randOffsetY = Math.random() * ASTEROIDGENRANDOFFSET - 0.5 * ASTEROIDGENRANDOFFSET;
					let newAsteroid = runtime.objects.Asteroid.createInstance(GAMELAYER, asteroidX * ASTEROIDGENSPACING + randOffsetX, asteroidY * ASTEROIDGENSPACING + randOffsetY);
					const randSize = Math.random() * (ASTEROIDMAXSIZE - ASTEROIDMINSIZE) + ASTEROIDMINSIZE;
					newAsteroid.width = randSize;
					newAsteroid.height = randSize;
					newAsteroid.setAnimation("" + Math.floor(Math.random() * 2));
					newAsteroid.angle = Math.random() * 2 * Math.PI;
				}
			}
		}

		for (let c = -ANIMALGENRENDDIST; c < ANIMALGENRENDDIST; c++)
		{
			for (let r = -ANIMALGENRENDDIST; r < ANIMALGENRENDDIST; r++)
			{
				const animalX = Math.floor(g_player.x / ANIMALGENSPACING + c);
				const animalY = Math.floor(g_player.y / ANIMALGENSPACING + r);
				if (((animalX < -1) || (animalX > 1) || (animalY < -1) || (animalY > 1)) && !([animalX, animalY] in g_animalDict))
				{
					g_animalDict[[animalX, animalY]] = true;

					const randOffsetX = Math.random() * ANIMALGENRANDOFFSET - 0.5 * ANIMALGENRANDOFFSET;
					const randOffsetY = Math.random() * ANIMALGENRANDOFFSET - 0.5 * ANIMALGENRANDOFFSET;
					let newAnimal = runtime.objects.Animal.createInstance(GAMELAYER, animalX * ANIMALGENSPACING + randOffsetX, animalY * ANIMALGENSPACING + randOffsetY);
					newAnimal.g_isCaptured = false;
					newAnimal.setAnimation("" + Math.floor(Math.random() * 6));
					newAnimal.width = ANIMALSIZE;
					newAnimal.height = ANIMALSIZE;
					newAnimal.angle = Math.random() * 2 * Math.PI;
					newAnimal.g_xVel = Math.random() * ANIMALMAXVEL - 0.5 * ANIMALMAXVEL;
					newAnimal.g_yVel = Math.random() * ANIMALMAXVEL - 0.5 * ANIMALMAXVEL;
					newAnimal.g_rotVel = Math.random() * ANIMALMAXROTVEL - 0.5 * ANIMALMAXROTVEL;
				}
			}
		}

		if (g_player.testOverlap(g_ship))
		{
			if (!Tick_alreadyAtShip)
			{
				Tick_alreadyAtShip = true;

				let capturedAnimalCount = 0;
				const allAnimals = runtime.objects.Animal.getAllInstances();
				for (let i = 0; i < allAnimals.length; i++)
				{
					if (allAnimals[i].g_isCaptured)
					{
						capturedAnimalCount++;
						allAnimals[i].destroy();
					}
				}

				alert(`You recovered ${capturedAnimalCount} animals!`);
				g_playerBubble.g_bubbleSize = 0;
				totalAnimalsCollected += capturedAnimalCount;
				if (totalAnimalsCollected >= ANIMALCOUNTTOWIN)
				{
					runtime.layout.getLayer(TITLELAYER).isVisible = true;
					runtime.layout.getLayer(GAMELAYER).isVisible = false;
					
					g_dieDisplay.isVisible = false;
					g_winDisplay.isVisible = true;

					g_mainCamera.lookAtPosition(0, 0, CAMERAZ, 0, 0, 0, 0, 1, 0);
					isPaused = true;
				}
			}
		}
		else
		{
			if (g_playerBubble.g_bubbleSize <= MINPLAYERBUBBLESIZE)
			{
				/*g_player.x -= g_player.g_xVel * 3;
				g_player.y -= g_player.g_yVel * 3;
				g_player.g_xVel *= -0.5;
				g_player.g_yVel *= -0.5;*/
			}
			else
			{
				Tick_alreadyAtShip = false;
			}
		}

		if (!isPaused)
		{ g_mainCamera.lookAtPosition(g_player.x, g_player.y, CAMERAZ, g_player.x, g_player.y, 0, 0, 1, 0); }

		g_mainBackground.x = g_player.x;
		g_mainBackground.y = g_player.y;
		
		g_playerBubble.x = g_player.x;
		g_playerBubble.y = g_player.y;

		g_player.moveToTop();
		g_playerBubble.moveToTop();
		g_titleDisplay.moveToTop();
	}
}
