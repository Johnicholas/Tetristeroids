// A game state for showing a brief cutscene,
// including an image and some text.

'use strict';

var cutscene = function (jaws, machine, background_image, text_to_show) {
    return {
	background: new Image(),
	update_count: 0,

	setup: function () {
	    jaws.preventDefaultKeys(['space', 'escape']);
	    jaws.on_keydown('escape',  function () { machine.next_state(); });
	    jaws.context.font = '24pt Inconsolata';
	    jaws.context.textAlign = 'center';
	    jaws.context.fillStyle = 'black';
	    this.background.src = background_image;
	},
	draw: function () {
	    jaws.context.drawImage(this.background, 0, 0);
	    jaws.context.fillText(text_to_show,
				  jaws.width / 2,
				  jaws.height / 2);
	},
	update: function () {
	    // TODO: refactor this ridiculous update_count thing
	    // and put real time in
	    if (this.update_count >= 250) {
		machine.next_state();
	    } else {
		this.update_count += 1;
	    }
	}
    };
};
