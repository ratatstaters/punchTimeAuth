(function(){
    var password = document.getElementById("password");
    var d = [];
    var train = [];

    function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.visibility = 'hidden';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
    }

    password.onkeypress = function (e){
        //console.log("key: %s time: %s",event.keyCode, Date.now());
        d.push({k:e.keyCode,t:Date.now()})
    }

    document.auth.addEventListener('submit', function(e){
        e.preventDefault();
        var u = document.auth._username.value;
        var p = document.auth._password.value;

        var start = d[0].t;
        d.pop();

        for(var i=0; i<d.length; i++){
            d[i] = parseInt(d[i].t) - parseInt(start);
        }

        var data = "u="+u+"&p="+p+"&eq="+d.toString()+"&";

        xhr('/auth',data, function(data){
            var isTrueSet = (data == 'true');
            var inputs = document.getElementsByTagName("input");
            if(isTrueSet){
                for(var i=0; i<inputs.length-1;i++){
                    fade(inputs[i]);
                }
                for(var i=0; i<inputs.length-1;i++){
                    inputs[i].className="";
                }
                document.getElementsByTagName("button")[0].className="verified";
                document.getElementsByTagName("button")[0].innerHTML="authenticated";
            }
            else {
                for(var i=0; i<inputs.length-1;i++){
                    inputs[i].className="error";
                }
                function hide() {
                    inputs[0].className='';
                    inputs[1].className='';
                }
                setTimeout(hide, 1333);
            }
        });
        d=[];
        train=[];
        document.auth._password.innerHTML="";
        document.auth._password.value="";
    });
})();
