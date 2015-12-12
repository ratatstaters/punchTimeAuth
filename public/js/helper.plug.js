function xhr(url, params, cb){
    var http = new XMLHttpRequest();
    params += "_csrf="+document.getElementsByName("_csrf")[0].value;
    http.open("POST", document.location.origin+url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
            cb(http.responseText);
        }
    }
    http.send(params);
}
// Calculates Multiple Quantiles
// Requirements: both x and p can be arrays, x does not need to be sorted
// Example: quantile([2,1,3,5,4],[0.25,0.75])
function quantile(x,p) {
  if(typeof p === 'number') {
    return Q7(x.slice(0).sort(),p);
  }else{
    return p.map(function(pi){return Q7(x.slice(0).sort(),pi)});
  }
}

// Calculates Quantiles
// Requirements: x needs to be sorted, p must be a single number
// Example: Q7([1,2,3,5,4],0.33)
// Notes: Uses type 7 quantiles as described by Hyndman and Fan
//        This is the default method for calculating quantiles in R
function Q7(xsort,p) {
  var n = xsort.length;
  var m = 1-p;
  var j = Math.floor(n*p + m);
  var g = n*p + m - j;
  return (1 - g)*xsort[j-1] + g*xsort[j];
}

// Really?
function mean(x) {
  return x.reduce(function(a,b){
    return a + b;
  })/x.length;
}

// Generates Nearly Normal RV by taking advantage of CLT
// Notes: Hacky approximation, sum up enough uniformly distributed rv and it's approx gaussian
//        Constants subtracted and divided correct for mean and sd
//        For our purposes, this is probabily better than a more accurate method such as Box-Muller,
//        because we don't want our tails to extend out to -inf and inf
function rnorm() {
  return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 0.7071068;
}

// Generates normal RV using Box-Muller transform
function rnorm2() {
  var U1 = Math.random();
  var U2 = Math.random();
  var Z1 = Math.sqrt(-2*Math.log(U1))*Math.cos(2*Math.PI*U2);
  var Z2 = Math.sqrt(-2*Math.log(U1))*Math.sin(2*Math.PI*U2);
  return (Z1+Z2) / Math.sqrt(2);
}

// Calculates the number of digits after a decimal point, code courtesy of Mike Samuel on Stack Overflow
function decimalPlaces(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
}

// Train the fit
// Requirements: takes an array of arrays, cumulative times
// Example: getFit([[0,5,8,12,16],[0,6,7,11,16],[0,7,10,16,23],[0,5,7,12,16],[0,5,6,10,16]])
function getFit(trainingData) {
  var tdiff = trainingData.map(function(x,i){return x.slice(1,x.length).map(function(y,j){return y-trainingData[i][j];});});
  var tt = tdiff[0].map(function(col, i) {
    return tdiff.map(function(row) {
      return row[i]
    })
  });
  var ttq = tt.map(function(x) {
    return quantile(x,[0.25,0.75]);
  });
  var ttqmean = quantile(ttq.map(function(x) {
    return (x[1]-x[0]);
  }),0.5);
  var ttmean = tt.map(mean);
  var ttlower = ttq.map(function(x){
    return x[0]-4*ttqmean;
  })
  var ttupper = ttq.map(function(x){
    return x[1]+4   *ttqmean;
  })
  var lowertemp = quantile(ttlower,[0.25,0.5,0.75]);
  var ttlowermean = lowertemp[1];
  var ttloweriqr = lowertemp[2]-lowertemp[0];
  var uppertemp = quantile(ttupper,[0.25,0.5,0.75]);
  var ttuppermean = uppertemp[1];
  var ttupperiqr = uppertemp[2]-uppertemp[0];
  var lowerpow = Math.pow(10,decimalPlaces(ttlower[0]))
  var upperpow = Math.pow(10,decimalPlaces(ttupper[0]))
  while(ttlower.length<50){
    ttlower.push(Math.ceil(lowerpow*Math.abs(rnorm()*ttloweriqr*0.746+ttlowermean))/lowerpow);
    ttupper.push(Math.ceil(upperpow*Math.abs(rnorm()*ttupperiqr*0.746+ttuppermean))/upperpow);
  }
  fit = [ttlower,ttupper];
  return fit;
}

// Test the fit
// Requirements: takes an array of new data along with the output from getFit
// Example: fits([0,4,7,10,23],getFit([[0,5,8,12,16],[0,6,7,11,16],[0,7,10,16,23],[0,5,7,12,16],[0,5,6,10,16]]))
function fits(newData,fit) {
  diffs = newData.slice(1,newData.length).map(function(y,j){return y-newData[j];});
  //ii = 0;
  for (var ii=0; ii < diffs.length; ii++) {
    if(diffs[ii]<fit[0][ii] || diffs[ii]>fit[1][ii]){
      return false;
    }
  }
  return true;
}


// //TestCase
// var trainingData =
// [[1.41855478286743, 1.52226376533508, 1.746426820755, 1.90627694129944, 2.11443996429443, 2.41026496887207, 2.65830183029175, 2.85019779205322, 2.93041086196899],
// [1.07279801368713, 1.17561197280884, 1.43980288505554, 2.09588289260864, 2.32885885238647, 2.61586880683899, 2.86470484733582, 3.02636289596558, 3.10594797134399],
// [1.59993815422058, 1.71170711517334, 1.90366911888123, 2.05562210083008, 2.28783297538757, 2.57532000541687, 2.84785509109497, 3.06377601623535, 3.16763496398926],
// [1.32802987098694, 1.48786997795105, 1.67990684509277, 1.87989091873169, 2.08804798126221, 2.39183688163757, 2.66390085220337, 2.88771200180054, 3.09573292732239],
// [1.20772695541382, 1.35189700126648, 1.60118007659912, 1.79165887832642, 2.13569188117981, 2.47965693473816, 2.75182008743286, 2.93576502799988, 3.03166794776917]];
//
// var newData = [1.20772695541382, 1.35189700126648, 1.60118007659912, 1.79165887832642, 2.13569188117981, 2.47965693473816, 2.75182008743286, 2.93576502799988, 3.03166794776917];
//
// var trainingData = [[0,5,8,12,16],[0,6,7,11,16],[0,7,10,16,23],[0,5,7,12,16],[0,5,6,10,16]]
// var newData = [0,4,7,10,23]
//
// fit = getFit(trainingData)
// fits(newData,fit)
