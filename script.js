(function(){
	var gameManger = {
		isGameOver: false,
		timeTilNextQuestion: 5,
		questionCountDown: function(){
			if(this.timeTilNextQuestion > 0){
				this.timeTilNextQuestion -= 1;
			} else {
				this.timeTilNextQuestion = 10;
				questionHandler.getNewQuestion();
			}
		},
		gameOver: function(){
			this.isGameOver = true;
		}
	}
	var questionHandler = {
		questions: [],
		currentQuestion: {},
		getNewQuestion: function(){
			if(this.questions.length > 0){
				this.currentQuestion = this.questions.shift();
			} else {
				gameManger.gameOver();
			}
			this.buildQuestionHTML();
		},
		createQuestionObj: function(que,ansArray,ans){
			ansArray.push(ans);
			return {
				question: que,
				answers: ansArray,
				correctAnswer: ans
			}
		},
		buildQuestionHTML: function(){
			//Add answers
			$("#question").html(this.currentQuestion.question);
			for(choice in this.currentQuestion.answers){
				var ele = $("<a>");
				ele.href = "#";
				ele.addClass("list-group-item action list-group-item-warning");
				ele.html(this.currentQuestion.answers[choice]);
				$("#answers").append(ele);
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
		}
	}
	//jQuery stuff goes here.
	$(function(){
		$(".list-group-item").on('click', function(){
			console.log("CLICK");
			questionHandler.getNewQuestion();
		});
		$.ajax({
			url: 'https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple',
			dataType: 'json',
			type: 'GET'
		}).done(function(data){
			questionHandler.populateQuestions(data);
		});
	})
}())