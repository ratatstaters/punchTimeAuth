(function(){
    var counter = document.getElementById("counter");
    var password = document.getElementById("password");
    var passwords=[];
    var data = [];
    var train = [];
    var results = [];
    var count = 0;

    function error(inputs){
        for(var i=0; i<inputs.length-1;i++){
            inputs[i].className="error";
        }
        function hide() {
            inputs[0].className='';
            inputs[1].className='';
            inputs[2].className='';
        }
        setTimeout(hide, 1333);
    }

    password.onkeypress = function (e){
        //console.log("key: %s time: %s",event.keyCode, Date.now());
        data.push({k:e.keyCode,t:Date.now()})
    }

    document.getElementsByTagName("form")[0].addEventListener('submit', function(e){
        e.preventDefault();
        var inputs = document.getElementsByTagName("input");
        var username = document.getElementById("username");
        var email = document.getElementById("email");
        var isSamePassword = true;
        passwords.push(password.value);

        //update counter
        for(var i=0; i<passwords.length-1;i++){
            if(passwords[i]!=passwords[i+1]){
                isSamePassword=false;
            }

        }
        if(isSamePassword)
            count++
        else{
            error(inputs);
            document.location.href="/registration/";
        }

        counter.innerHTML=count%6;

        var start = data[0].t;
        data.pop();

        for(var i=0; i<data.length; i++){
            data[i] = parseInt(data[i].t) - parseInt(start);
        }
        train.push(data);

        data=[];
        if(count==5){

            //Compute the fitting matrix
            fit = getFit(train);

            if(username.value != '' && password.value != ''  && email.value != '' ){
                var userData="e="+email.value+"&p="+password.value+"&u="+username.value+"&fit="+fit+"&";
                xhr("/register",userData, function(data){
                    var isTrueSet = (data == 'true');
                    if(isTrueSet){
                        setTimeout(function(){
                            document.location.href="/";
                        },100)
                    }
                    else{
                        error(inputs);
                    }
                });
            }
            else{
                error(inputs);
            }
        }
        password.value="";
    });
})();
