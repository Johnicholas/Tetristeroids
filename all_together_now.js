jaws.assets.add([
    "background1.png",
    "background2.png",
]);

function wrap(value, max) {
    value %= max;
    // we want to guarantee the output is within [0..max),
    // and javascript modulus doesn't quite do it,
    // so we have to fix up negatives.
    if (value < 0) {
	value += max;  
    }
    return value;
};

state_machine.states = {
    intro: [
	cutscene(jaws, state_machine, {
	    background_image: 'background1.png',
	    text: [
		'This is a terrifying mixture of tetris...'
	    ]
	}),
	tetris_clone(jaws, state_machine,
		     30, 'background1.png'
		    ),
	cutscene(jaws, state_machine, {
	    background_image: 'background1.png',
	    text: [
		'... and asteroids.'
	    ]
	}),
	asteroids(jaws, state_machine,
		  3
		 )
    ],
    loop: function (x) {
	return [
	    cutscene(jaws, state_machine, {
		background_image: 'background2.png',
		text: [
		    'Death will avail you nothing.'
		]
	    }),
	    tetris_clone(jaws, state_machine,
			 30, 'background2.png'
			),
	    cutscene(jaws, state_machine, {
		background_image: 'background1.png',
		text: [
		    'The show must go on.'
		]
	    }),
	    asteroids(jaws, state_machine,
		      2 + x // difficulty parameter calculated from level
		     )
	]
    },
    get: function (which) {
	if (which < this.intro.length) {
	    return this.intro[which];
	} else {
	    var loop_instance = this.loop(which);
	    return loop_instance[wrap(which, loop_instance.length)];
	}
    }
};
    
jaws.start(state_machine);

