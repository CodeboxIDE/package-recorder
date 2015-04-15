var templateForm = require("./templates/form.html");

var _ = codebox.require("hr.utils");
var commands = codebox.require("core/commands");
var FormView = codebox.require("views/form");
var View = codebox.require("hr.view");


function interleave(leftChannel, rightChannel){
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length; ){
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

function mergeBuffers(channelBuffer, recordingLength){
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++){
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function writeUTFBytes(view, offset, string){
    var lng = string.length;
    for (var i = 0; i < lng; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}


var Dialog = View.Template.extend({
    tagName: "div",
    className: "component-recorder",
    template: templateForm,
    events: {
        "click .do-save": "doSave",
        "click .do-record": "doRecord",
        "click .do-discard": "doDiscard",
        "click .do-close": "doClose"
    },

    initialize: function() {
        Dialog.__super__.initialize.apply(this, arguments);

        var that = this;

        this.leftchannel = [];
        this.rightchannel = [];
        this.recorder = null;
        this.recording = false;
        this.recordingLength = 0;
        this.volume = null;
        this.audioInput = null;
        this.sampleRate = null;
        this.audioContext = null;
        this.context = null;

        // creates the audio context
        this.audioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new audioContext();

        // we query the context sample rate (varies depending on platforms)
        this.sampleRate = this.context.sampleRate;

        console.log('succcess');

        // creates a gain node
        this.volume = this.context.createGain();

        // creates an audio node from the microphone incoming stream
        this.audioInput = this.context.createMediaStreamSource(e);

        // connect the stream to the gain node
        this.audioInput.connect(this.volume);

        /* From the spec: This value controls how frequently the audioprocess event is
        dispatched and how many sample-frames need to be processed each call.
        Lower values for buffer size will result in a lower (better) latency.
        Higher values will be necessary to avoid audio breakup and glitches */
        var bufferSize = 2048;
        this.recorder = this.context.createScriptProcessor(bufferSize, 2, 2);

        recorder.onaudioprocess = function(e){
            if (!that.recording) return;
            var left = e.inputBuffer.getChannelData (0);
            var right = e.inputBuffer.getChannelData (1);

            // we clone the samples
            that.leftchannel.push (new Float32Array (left));
            that.rightchannel.push (new Float32Array (right));
            that.recordingLength += bufferSize;
            console.log('recording');
        }

        // we connect the recorder
        volume.connect (recorder);
        recorder.connect (context.destination);
    },

    // Submit form
    doSave: function(e) {
        if (e) e.preventDefault();

        this.stopRecording();
        this.parent.close(e);
    },

    // Start recording
    doRecord: function(e) {
        if (e) e.preventDefault();

        this.recording = true;
        this.leftchannel.length = rightchannel.length = 0;
        this.recordingLength = 0;
    },

    // Stop recording
    stotRecording: function() {
        // we stop recording
        this.recording = false;

        //outputElement.innerHTML = 'Building wav file...';

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers (this.leftchannel, this.recordingLength);
        var rightBuffer = mergeBuffers (this.rightchannel, this.recordingLength);

        // we interleave both channels together
        var interleaved = interleave(this.leftBuffer, this.rightBuffer);

        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, this.sampleRate, true);
        view.setUint32(28, this.sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob ( [ view ], { type : 'audio/wav' } );
        var url = (window.URL || window.webkitURL).createObjectURL(blob);

        console.log(url);

        return blob;
    },

    // Discard
    doDiscard: function(e) {
        if (e) e.preventDefault();

        this.stopRecording();
    },

    // Close dialog
    doClose: function(e) {
        this.stopRecording();
        this.parent.close(e);
    }
});

module.exports = Dialog;
