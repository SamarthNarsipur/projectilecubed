
###projectile sim

A simple web-based projectil simulator that lets you launch things on a canvas and look at the trajectory arc. Built this because I was bored and didn't want to calculate projectile physics by hand for class. It completely ignores air resistance and friction because nobody has time for that math.

##description

Basically, you put in an initial velocity and a launch angle, hit the compute button, and it draws the path instantly. It also gives you some live data like flight time, range, and height, plus a little vector FBD mode on the side.

##how to run it

You dont need to install anything or run any npm install commands.
1. Just clone the repo or download the zip.
2. Open index.html in whatever browser you use (chrome, firefox, etc).
Or you can just check out the live version here: github.io

##troubleshoot things

• If it goes off screen: The velocity is probably way too high, just turn it down a bit.
• If it just goes straight up: check your launch angle, you probably left it at 90 degrees.

##license

MIT license i guess, feel free to use the code for whatever.
