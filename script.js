(function(){
	var DEFAULT_TIME = 15;
	var soundManager = {
		outOfTime: new Audio("./assets/sounds/ticktock.wav"),
		playOutOfTime: function(){
			soundManager.outOfTime.loop = true;
			soundManager.outOfTime.play();
		},
		pauseOutOfTime: function(){
			soundManager.outOfTime.pause();
			soundManager.outOfTime.currentTime = 0;
		}
	};
	var countDownTimer = {
		time: DEFAULT_TIME,
		countInterval: {},
		countDown: function(){
			if(countDownTimer.time <= 0){
				countDownTimer.resetTimer();
				questionHandler.logAnswer(false);
				questionHandler.getNewQuestion();
				gameManger.incorrect++;
				soundManager.pauseOutOfTime();
			} else {
				countDownTimer.time--;
				if(countDownTimer.time === 5){
					soundManager.playOutOfTime();
				}
			}
			gameManger.updateHTML();
		},
		resetTimer: function(){
			soundManager.pauseOutOfTime();
			countDownTimer.time = DEFAULT_TIME;
		},
		stopTimer: function(){
			clearInterval(countDownTimer.countInterval);
		}
	};
	var gameManger = {
		isGameOver: false,
		correct: 0,
		incorrect: 0,
		gameStart: function(){
			this.isGameOver = false;
			this.correct = 0;
			this.incorrect = 0;
			questionHandler.currentQuestion = {};
			questionHandler.questions = [];
			countDownTimer.countInterval = setInterval(countDownTimer.countDown,1000);
			$.ajax({
				url: 'https://opentdb.com/api.php?amount=10&category=15&difficulty=easy&type=multiple',
				dataType: 'json',
				type: 'GET'
			}).done(function(data){
				questionHandler.populateQuestions(data);
			});
		},
		updateHTML: function(){
			if(this.isGameOver){
				$("#timer").html("Game Over");
			} else {
				$("#timer").html("Time: " + countDownTimer.time);
				$("#correct").html("Correct: " + gameManger.correct);
				$("#incorrect").html("Incorrect: " + gameManger.incorrect);
			}
		},
		gameOver: function(){
			this.updateHTML();
			this.isGameOver = true;
			countDownTimer.stopTimer();
		}
	};
	var questionHandler = {
		questions: [],
		currentQuestion: {},
		getNewQuestion: function(){
			if(this.questions.length > 0){
				this.currentQuestion = this.questions.shift();
			} else {
				gameManger.gameOver();
			}
			countDownTimer.resetTimer();
			this.buildQuestionHTML();
		},
		createQuestionObj: function(que,ansArray,ans){
			ansArray.push(ans);
			this.shuffle(ansArray);
			return {
				question: que,
				answers: ansArray,
				correctAnswer: ans
			}
		},
		logAnswer: function(isCorrect){
			if(!gameManger.isGameOver){
				var answer = $("<div>");
				answer.addClass("card");
				answer.css({"border":"2px solid"})
				if(!isCorrect){
					answer.addClass("card-warning");
				} else {
					answer.addClass("card-success");
				}
				answer.html("Question: " + questionHandler.currentQuestion.question + "<br/>Answer: " + questionHandler.currentQuestion.correctAnswer);
				$("#answered").prepend(answer);
			}
		},
		buildQuestionHTML: function(){
			//Add answers
			$("#question").html(this.currentQuestion.question);
			$("#answers").empty();
			for(choice in this.currentQuestion.answers){
				var ele = $("<a>");
				ele.href = "#";
				ele.addClass("list-group-item action list-group-item-warning");
				ele.html(this.currentQuestion.answers[choice]);
				$("#answers").append(ele);
			}
			gameManger.updateHTML();
			this.addQuestionListener();
		},
		addQuestionListener: function(){
			$(".list-group-item").on('click', function(){
				questionHandler.score(this);
				questionHandler.getNewQuestion();
			});
		},
		score: function(answer){
			if($(answer).html() === questionHandler.currentQuestion.correctAnswer){
				gameManger.correct++;
				this.logAnswer(true);
			} else {
				gameManger.incorrect++;
				this.logAnswer(false);
			}
		},
		populateQuestions: function(data){
			for(quest in data.results){
				this.questions.push(this.createQuestionObj(
					data.results[quest].question,
					data.results[quest].incorrect_answers,
					data.results[quest].correct_answer
					));
			}
			this.getNewQuestion();
		},
		shuffle: function(array) {
		  var i = 0
		    , j = 0
		    , temp = null

		  for (i = array.length - 1; i > 0; i -= 1) {
		    j = Math.floor(Math.random() * (i + 1))
		    temp = array[i]
		    array[i] = array[j]
		    array[j] = temp
		  }
		}
	};
	//jQuery stuff goes here.
	$(function(){
		$("#start").on('click', function(){
			gameManger.gameStart();
		});
	})
}())