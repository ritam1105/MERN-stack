document.addEventListener("DOMContentLoaded",function(){
    const searchButton=document.getElementById("search-btn");
    const userNameInput=document.getElementById("user-input");

    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");

    const easyLebel=document.getElementById("easy-label");
    const mediumLebel=document.getElementById("medium-label");
    const hardLebel=document.getElementById("hard-label");

    const cardStatsContainer=document.querySelector(".stats-card");

    function validateUsername(userName){
        if(userName.trim()===""){
            alert("Username should not be empty!");
            return false;
        }
        const regex=/^[a-zA-Z0-9 _-]{1,15}$/;
        const isMatching=regex.test(userName);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }
    function updateProgress(solved,total,label,circle){
        const progressDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.textContent=`${solved}/${total}`;
    }
    
    function displayUserData(parsedata){
        const totalQues=parsedata.data.allQuestionsCount[0].count;
        const totalHardQues=parsedata.data.allQuestionsCount[3].count;
        const totalMediumQues=parsedata.data.allQuestionsCount[2].count;
        const totalEasyQues=parsedata.data.allQuestionsCount[1].count;

        const totalSolved=parsedata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const easySolved=parsedata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const mediumSolved=parsedata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const hardSolved=parsedata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(easySolved,totalEasyQues,easyLebel,easyProgressCircle);
        updateProgress(mediumSolved,totalMediumQues,mediumLebel,mediumProgressCircle);
        updateProgress(hardSolved,totalHardQues,hardLebel,hardProgressCircle);

        const cardData=[
            {label:"Overall Submission", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:"Overall Easy Submission", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:"Overall Medium Submission", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:"Overall Hard Submission", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},

        ];
        cardStatsContainer.innerHTML=cardData.map(
            data=>{
                return `<div class="card">
                <h3>${data.label}<h3/>
                <p>${data.value}</p>
                </div>`
            }
        ).join("")
    }

    async function fetchUsername(userName){
        try{
            searchButton.textContent="Seaching...";
            searchButton.disabled=true;
            const proxyUrl='https://cors-anywhere.herokuapp.com/'
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n      allQuestionsCount {\n        difficulty\n        count\n      }\n      matchedUser(username: $username) {\n        submitStats {\n          acSubmissionNum {\n            difficulty\n            count\n            submissions\n          }\n          totalSubmissionNum {\n            difficulty\n            count\n            submissions\n          }\n        }\n      }\n    }\n",
                variables: { "username": `${userName}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };
            const response=await fetch(proxyUrl+targetUrl,requestOptions);
            if(!response.ok){
                throw new Error("uable to fetch");
            }
            const parsedata=await response.json();
            console.log("logging data: ",parsedata);
            displayUserData(parsedata);
        }
        catch(error){
            statsContainer.innerHTML=`<p>NO DATA FOUND.</p>`;
        }finally{
            searchButton.textContent="Search";
            searchButton.disabled=false;
        }
    }
    searchButton.addEventListener('click',function(){
        const userName=userNameInput.value;
        console.log("username is:"+ userName);
        if(validateUsername(userName)){
            fetchUsername(userName);
        }
    })

})