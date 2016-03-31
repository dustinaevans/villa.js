#Villa.js

###Description
Villa.js was intended to be a module for node.js that helps makers easily build home automation and monitoring systems.
However, it seems that I prefer writing a full application over writing a simple module. Therefore, I will write the full application with a focus on 
reusability for deployment in any home and document the API endpoints so that people may develop their own applications to access it. A web
application will be included in the package for easy startup, but I am not a very good front-end designer, so it is likely that it will take some time
for the application to be worth using.

###Pricing
* Versions 0.x.x - 1.x.x will be free to use.
* Versions 2.x.x and forward will be licensed.
* There is a possibility of a free version with limited features

##Documentation

##How it works
>This section will change

At the moment, there are two pieces to this puzzle.
1. Villa
2. Workers

Villa is the "brain" of this project.
Workers send/get information and events from Villa

Villa is ignorant of the way that workers do their jobs.

Example:
Wokrer 1 is a machine \(Raspberry-pi, PC, etc.)\ connected to some type of motion detection hardware.
>In my test case, I used an Arduino with Johnny-five and a PC.

Worker 1 detects motion and posts a JSON object that models a motion event to Villa
```json
{
    event:{
        type:'motion',
        worker:'0001'
    }
}
```
Villa then takes some action based on this event.
    *Log the event to the terminal and log file
    *Send an event to another worker
        *Possibly sound an alarm and flash a light

###API
