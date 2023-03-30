let select = document.querySelector(".container select#city-name");
let title = document.querySelector(".container .title");
let date = document.querySelector(".container .date");
let timesContainer = document.querySelector(".container .times");

let cities = [
  { arName:"القاهرة", name:"Al Qāhirah", code: "EG-C"},
  { arName:"الدقهلية", name:"Ad Daqahlīyah", code: "EG-DK"},
  { arName:"البحر الأحمر", name:"Al Baḩr al Aḩmar", code: "EG-BA*"},
  { arName:"البحيرة", name:"Al Buḩayrah", code: "EG-BH"},
  { arName:"الفيوم", name:"Al Fayyūm", code: "EG-FYM"},
  { arName:"الغربية", name:"Al Gharbīyah", code: "EG-GH"},
  { arName:"الأسكندرية", name:"Al Iskandarīyah", code: "EG-ALX"},
  { arName:"الإسماعلية", name:"Ismailia", code: "EG-IS"},
  { arName:"الجيزة", name:"Giza", code: "EG-GZ"},
  { arName:"المنيا", name:"Al Minyā", code: "EG-MN"},
  { arName:"المنوفية", name:"Al Minūfīyah", code: "EG-MNF"},
  { arName:"القليوبية", name:"Al Qalyūbīyah", code: "EG-KB"},
  { arName:"الأقصر", name:"Al Uqşur", code: "EG-LX*"},
  { arName:"الوادي الجديد", name:"Al Wādī al Jadīd", code: "EG-WAD"},
  { arName:"السويس", name:"As Suways", code: "EG-SUZ"},
  { arName:"الشرقية", name:"Ash Sharqīyah", code: "EG-SHR"},
  { arName:"أسوان", name:"Aswān", code: "EG-ASN"},
  { arName:"أسيوط", name:"	Asyūţ", code: "EG-AST"},
  { arName:"بنى سويف", name:"Banī Suwayf", code: "EG-BNS"},
  { arName:"بور سعيد", name:"Būr Sa‘īd", code: "EG-PTS"},
  { arName:"دمياط", name:"Dumyāţ", code: "EG-DT"},
  { arName:"جنوب سيناء", name:"Janūb Sīnā", code: "EG-JS*"},
  { arName:"شمال سيناء", name:"Shamāl Sīnā", code: "EG-SIN"},
  { arName:"كفر الشيخ", name:"	Kafr ash Shaykh", code: "EG-KFS"},
  { arName:"مرسى مطروح", name:"Maţrūḩ", code: "EG-MT"},
  { arName:"قنا", name:"Qinā", code: "EG-KN"},
  { arName:"سوهاج", name:"Sohaj", code: "EG-SHG"},
];

cities.forEach((city) => {
  select.innerHTML += `<option value='${city.name}'>${city.arName}</option>`
});

select.addEventListener("change", function() {
  fetchData(this.value);
  document.querySelectorAll(".times .time").forEach((el) => {
    clearInterval(el.getAttribute("id"))
  });
});

function fetchData(city) {
  fetch(`https://api.aladhan.com/v1/timingsByCity?country=EG&city=${city}`)
  .then((res) => res.json())
  .then((data) => {
    getInfo(data.data);
  }).catch((err) => {
    console.log(err);
  });
  
  cities.forEach((el) => {
    if(el.name == select.value) {
      title.innerHTML = el.arName;
    }
  });
}


function handleLoation() {
  navigator.geolocation.getCurrentPosition((position) => {

    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
  
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
    .then((res) => res.json())
    .then((data) => {
      cities.forEach((city) => {
        if(city.code == data.principalSubdivisionCode) {
          fetchData(city.name)
          title.innerHTML = city.arName;
          
          select.querySelectorAll('option').forEach((option) => {
            if(option.value == city.name) {
              option.selected="selected";
            }
          });
        }
      })
    });
  });
}
handleLoation();


function getInfo(data) {
  // Handle Prays Time
  prays = {
    "Fajr": "الفجر",
    "Sunrise": "الشروق",
    "Dhuhr": "الظهر",
    "Asr": "العصر",
    "Maghrib": "المغرب",
    "Isha": "العشاء",
  }

  timesContainer.innerHTML = "";
  for(pray of Object.entries(prays)) {
    let time = data.timings[pray[0]];
    let hours = parseInt(time);
    let minutes = time.substring(time.indexOf(":")+1, time.length);
    let period = "ص";

    handleTime(hours, minutes, pray[0]);

    if(hours > 12) {
      period = "م";
      hours = `0${hours%12}`;
    } else if(hours == 12) {
      period = "م";
    }

    timesContainer.innerHTML += `
      <div class="box">
        <h2 class="pray-name">${prays[pray[0]]}</h2>
        <p class="pray-time"><span>${hours}:${minutes}</span>${period}</p>
        <p class="time ${pray[0]}">--</p>
      </div>
      `;
    }

  // Handle Date
  let hijri = data.date.hijri;
  date.innerHTML = `${hijri.weekday.ar}  ${hijri.day} ${hijri.month.ar} ${hijri.year} | ${data.date.gregorian.date}`;

  // Display Name
  document.querySelector(".container").style.display="block";
  document.querySelector(".loader").style.display="none"
}


function handleTime(hours, minutes, pray) {

  let targetTime = new Date(`${new Date().toDateString()} ${hours}:${minutes}`);
  let remainHours=0, remainMinutes=0, remainSeconds=0;

  let id = setInterval(() => {
    let today = new Date();
    let diff = targetTime - today;
    
    remainHours = parseInt(diff / (1000 * 60 * 60)) < 10 ? "0"+ parseInt(diff / (1000 * 60 * 60)) : parseInt(diff / (1000 * 60 * 60));
    remainMinutes = parseInt(diff % (1000 * 60 * 60) / (1000 * 60)) < 10 ? "0"+ parseInt(diff % (1000 * 60 * 60) / (1000 * 60)) :  parseInt(diff % (1000 * 60 * 60) / (1000 * 60))
    remainSeconds = parseInt(diff % (1000 * 60 ) / 1000) < 10 ? "0" + parseInt(diff % (1000 * 60 ) / 1000) : parseInt(diff % (1000 * 60 ) / 1000);
    
    document.querySelectorAll(".time").forEach((el) => {
      if(el.classList.contains(pray)) {
        el.innerHTML = `متبقى: ${remainHours}:${remainMinutes}:${remainSeconds}`;
        el.parentElement.classList.add("active");
        el.setAttribute("id", id);
        
        if(diff < 0) {
          el.innerHTML = "تم"
          el.parentElement.classList.remove("active");
          clearInterval(id);
        }

        if(+remainHours==0 && +remainMinutes==0 && +remainSeconds==0) {
          document.querySelector("audio").play();
          let notify = new Notification(`الان صلاه`+` ${prays[pray]} `, {icon: "./logo.png"});
          clearInterval(id);
        }
      } 

    });

  }, 1000);

}