// Asteroids,
// based on the Ruby/Gosu version by adambair,
// using jaws by ippa.

'use strict';

var asteroids = function (jaws, machine, initial_asteroid_count) {
    function random(max) {
	return Math.floor(Math.random() * (max + 1));
    };

    function wrap(value, max) {
	value %= max;
	// we want to guarantee the output is within [0..max),
	// and javascript modulus doesn't quite do it,
	// so we have to fix up negatives.
	if (value < 0) {
	    value += max;  
	}
	return value;
    }

    // constructs a new asteroid of the given size
    function Asteroid(size) {
	this.x = random(jaws.width);
	this.y = random(jaws.height);
	this.draw_angle = random(360);
	this.size = size;
	this.speed = Math.random();
	if (size === 'large') {
	    this.speed += 0.5;
	    this.points = 20;
	    this.radius = 100;
	} else if (size === 'medium') {
	    this.speed += 1.5;
	    this.points = 50;
	    this.radius = 50;
	} else if (size == 'small') {
	    this.speed += 2.5;
	    this.points = 100;
	    this.radius = 20;
	}
	this.move_angle = random(360);
	// TODO: refactor these magic numbers 0.4, 2, 0.5
	this.corners = [];
	for (var i = 0; i < (2 * Math.PI); i += 0.4) {
	    var current_radius = (Math.random() / 2 + 0.5) * this.radius;
	    this.corners.push({x: Math.cos(i) * current_radius,
			       y: Math.sin(i) * current_radius});
	}
	// TODO: random angular velocity
	this.alive = true;
    };

    function spawn_asteroids(count, size) {
	var result = []
	for (var i = 0; i < count; ++i) {
	    result.push(new Asteroid(size));
	}
	return result;
    }

    Asteroid.prototype = {
	collides_with: function (other) {
	    var dx = this.x - other.x;
	    var dy = this.y - other.y;
	    return dx * dx + dy * dy < this.radius * this.radius;
	},
	kill: function () {
	    if (!this.alive) {
		// don't kill the same thing multiple times.
		return [];
	    }
	    var fragments;
	    this.alive = false;
	    if (this.size == 'large') {
		fragments = spawn_asteroids(3, 'medium');
	    } else if (this.size == 'medium') {
		fragments = spawn_asteroids(3, 'small');
	    } else {
		fragments = [];
	    }
	    for (var i in fragments) {
		fragments[i].x = this.x;
		fragments[i].y = this.y;
	    }
	    var hit = jaws.assets.get("hit.wav");
	    hit.play();
	    return fragments;
	},
	draw: function () {
	    jaws.context.save();
	    jaws.context.translate(this.x, this.y);
	    jaws.context.rotate((2*Math.PI/360) * this.draw_angle);
	    jaws.context.beginPath();
	    jaws.context.moveTo(this.corners[0].x, this.corners[0].y);
	    for (var i = 1; i < this.corners.length; ++i) {
		jaws.context.lineTo(this.corners[i].x, this.corners[i].y);
	    }
	    jaws.context.closePath();
	    jaws.context.strokeStyle = 'white';
	    jaws.context.stroke();
	    jaws.context.restore(); // pop state stack and restore state
	},
	update: function () {
	    this.x += Math.cos((2*Math.PI/360)*this.move_angle) * this.speed;
	    this.y += Math.sin((2*Math.PI/360)*this.move_angle) * this.speed;
	    this.x = wrap(this.x, jaws.width);
	    this.y = wrap(this.y, jaws.height);
	    // TODO: change the draw angle by the angular velocity
	}
    };

    function Projectile(origin) {
	this.x = origin.x;
	this.y = origin.y;
	this.velocity_x = origin.velocity_x;
	this.velocity_y = origin.velocity_y;

	// TODO: refactor this magic number 6 (pixels per update? what?)
	var angle = origin.angle;
	this.velocity_x += Math.cos((2*Math.PI/360) * angle) * 6; 
	this.velocity_y += Math.sin((2*Math.PI/360) * angle) * 6;

	// TODO: use time for real, not updates
	this.time_in_existence = 0; 
	this.alive = true;
    };
    Projectile.prototype = {
	draw: function () {
	    jaws.context.fillStyle = 'white';
	    jaws.context.fillRect(this.x, this.y, 1, 1);
	},
	update: function () {
	    // TODO: refactor this magic number 70
	    if (this.time_in_existence <= 70) {
		this.time_in_existence += 1;
	    } else {
		this.alive = false;
	    }
	    this.x += this.velocity_x;
	    this.y += this.velocity_y;
	    this.x = wrap(this.x, jaws.width);
	    this.y = wrap(this.y, jaws.height);
	}
    };

    function Player() {
	this.x = jaws.width / 2;
	this.y = jaws.height / 2;
	this.angle = random(360);
	this.velocity_x = 0.0;
	this.velocity_y = 0.0;
	this.alive = true;
    };
    Player.prototype = {
	turn_left: function () {
	    // TODO: refactor this magic number 4.3
	    this.angle -= 4.3; 
	},
	turn_right: function () {
	    // TODO: refactor this magic number 4.3
	    this.angle += 4.3;
	},
	accelerate: function () {
	    // TODO: refactor this magic number 0.07
	    this.velocity_x += Math.cos((2*Math.PI/360) * this.angle) * 0.07;
	    this.velocity_y += Math.sin((2*Math.PI/360) * this.angle) * 0.07;
	},
	draw: function () {
	    jaws.context.save(); // push state on state stack
	    jaws.context.translate(this.x, this.y);
	    jaws.context.rotate((2*Math.PI/360) * this.angle);
	    jaws.context.beginPath();
	    jaws.context.moveTo(17.5, 0);
	    jaws.context.lineTo(-10, 10);
	    jaws.context.lineTo(-5, 5);
	    jaws.context.lineTo(-5, -5);
	    jaws.context.lineTo(-10, -10);
	    jaws.context.lineTo(17.5, 0);
	    jaws.context.strokeStyle = 'white';
	    jaws.context.stroke();
	    jaws.context.restore(); // pop state stack and restore state
	},
	update: function () {
	    this.x += this.velocity_x;
	    this.y += this.velocity_y;
	    this.x = wrap(this.x, jaws.width);
	    this.y = wrap(this.y, jaws.height);
	    // TODO: refactor this magic number 0.991
	    this.velocity_x *= 0.991; 
	    this.velocity_y *= 0.991;
	},
	shoot: function () {
	    if (this.alive) {
		var laser = jaws.assets.get('laser.wav');
		laser.play();
		return new Projectile(this);
	    }
	}
    };

    return {
	setup: function () {
	    this.player = new Player();
	    this.level = 1;
	    this.score = 0;
	    this.lives = 3;
	    this.asteroid_count = initial_asteroid_count;
	    this.asteroids = spawn_asteroids(this.asteroid_count, 'large');
	    this.particles = [];
	    this.projectiles = [];

	    jaws.preventDefaultKeys(['up', 'down', 'left', 'right', 
				     'space', 'q']);
	    // Note: updownleftright are polled in update, not event-driven
	    jaws.on_keydown('q', function () {
		machine.previous_state();
	    });
	},
	draw: function () {
	    // clear the previous frame
	    jaws.context.fillStyle = 'black';
	    jaws.context.fillRect(0, 0, jaws.width, jaws.height);
	    for (var i in this.asteroids) {
		this.asteroids[i].draw();
	    }
	    this.player.draw();
	    for (var i in this.projectiles) {
		this.projectiles[i].draw();
	    }
	    // TODO: this.particles.draw();
	    jaws.context.fillStyle = 'white';
	    jaws.context.textAlign = 'left';
	    jaws.context.fillText(this.score, 10, 25);
	    // jaws.context.textAlign = 'right';
	    // jaws.context.fillText(this.level, 610, 25);
	    for (var i = 0; i < this.lives; ++i) {
		jaws.context.save();
		jaws.context.translate(40 + i * 20, 40);
		jaws.context.rotate((2*Math.PI/360)*270);
		Player.prototype.draw();
		jaws.context.restore();
	    }
	},
	update: function () {
	    for (var i in this.asteroids) {
		this.asteroids[i].update();
	    }
	    this.asteroids = this.asteroids.filter(function (it) {
		return it.alive;
	    });
	    if (jaws.pressed("left")) { this.player.turn_left(); }
	    if (jaws.pressed("right")) { this.player.turn_right(); }
	    if (jaws.pressed("up")) { this.player.accelerate(); }
	    if (jaws.pressed("space") && this.projectiles.length < 5) {
		this.projectiles.push(this.player.shoot());
	    }
	    this.player.update();
	    for (var i in this.projectiles) {
		this.projectiles[i].update();
	    }
	    this.projectiles = this.projectiles.filter(function (it) {
		return it.alive;
	    });
	    // TODO: move each particle
	    var new_asteroids = []
	    for (var i in this.asteroids) {
		if (this.asteroids[i].collides_with(this.player)) {
		    var explosion = jaws.assets.get('explosion.wav');
		    explosion.play();
		    this.lives -= 1;
		    if (this.lives === 0) {
			machine.previous_state();
		    } else {
			this.player = new Player();
		    }
		}
		for (var j in this.projectiles) {
		    if (this.asteroids[i].collides_with(this.projectiles[j])) {
			this.projectiles[j].alive = false;
			// TODO: spawn particles based on the asteroid
			this.score += this.asteroids[i].points;
			new_asteroids = new_asteroids.concat(
			    this.asteroids[i].kill()
			);
		    }
		}
	    }
	    this.asteroids = this.asteroids.concat(new_asteroids);
	    if (this.asteroids.length === 0) {
		// go to next level
		machine.next_state();
		/*
		this.level += 1;
		this.asteroid_count += 1;
		this.asteroids = spawn_asteroids(this.asteroid_count, 'large');
		*/
	    }
	}
    };
};
