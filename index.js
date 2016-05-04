/**
 * Created by madlord on 16/5/4.
 */
var recombiner = require('cortex-recombiner');

function CortexRecombinerPlugin(options) {
    this.opt=options
}

CortexRecombinerPlugin.prototype.apply = function(compiler) {
    var _self=this;
    function recombine () {
        recombiner({
            base:_self.opt.base|| __dirname,//项目根目录
            noBeta: !!_self.opt.noBeta//忽略neurons文件夹下beta版本的cortex包，如果开启此项功能，则必须保证neurons下所有的包都含有非beta版本
        });
        console.log("cortex recombination complete");
    }
    // Setup callback for accessing a compilation:
    recombine();
    compiler.plugin("invalid", function() {

        // Now setup callbacks for accessing compilation steps:
        recombine();
    });
};

module.exports = CortexRecombinerPlugin;


