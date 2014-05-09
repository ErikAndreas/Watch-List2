var Ractive = require('ractive');

Ractive.events.filedrop = function (node, fire) {

  function drag(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  function drop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('drop');
    var files = evt.dataTransfer.files; // FileList object.
    var f = files[0];
    if (f) {
      // assuming a file was dropped and we want its txt content
      console.log('filename', f.name);
      var r = new FileReader();
      r.onload = function (e) {
        var contents = e.target.result;
        //console.log('contents', contents);
        fire({
          node: node,
          contents: contents
        });
      };
      r.onerror = function (e) {
        console.log(e);
      };
      r.readAsText(f); // takes optional 2nd param encoding
    } else {
      // assuming a spotify artist was dragged + dropped
      fire({
        node: node,
        contents: evt.dataTransfer.getData('text/uri-list')
      });
    }
  }

  node.addEventListener('dragenter', drag);
  node.addEventListener('dragover', drag);
  node.addEventListener('drop', drop);

  return {
    teardown: function () {
      node.removeEventListener('dragenter', drag);
      node.removeEventListener('dragover', drag);
      node.removeEventListener('drop', drop);
    }
  };
};

module.exports.filedrop = Ractive.events.filedrop;
