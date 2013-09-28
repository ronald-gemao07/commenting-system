/*----------------------------------------------------------	Initialize App----------------------------------------------------------*/(function() {	window.App = {		Models: {},		Collections: {},		Views: {},		Router: {}	};	window.vent = _.extend({}, Backbone.Events);	window.template = function(id) {		return _.template( $('#' + id).html() );	};})();/*----------------------------------------------------------	Initialize Model----------------------------------------------------------*/App.Models.Comment = Backbone.Model.extend({	validate: function(attrs) {		if ( ! attrs.username ) {			return 'Author name is required';		}		if( ! attrs.description){			return 'Please enter a message';		}	},	idAttribute : "_id",	urlRoot: "/comments",	defaults : {		_id: null	}});/*----------------------------------------------------------	Initialize Collection----------------------------------------------------------*/App.Collections.Comments = Backbone.Collection.extend({	model: App.Models.Comment,	url: '/comments'});/*----------------------------------------------------------	Main  App View----------------------------------------------------------*/App.Views.App = Backbone.View.extend({	initialize: function() {		var addCommentsView = new App.Views.AddComment({ collection: App.comments});		var allCommentsView = new App.Views.Comments({ collection: App.comments });		$('#comments').append($(allCommentsView.render().el));	}});/*----------------------------------------------------------	Add Comment View----------------------------------------------------------*/App.Views.AddComment = Backbone.View.extend({	el: 'button#add',	initialize: function() {		this.username= $('input[name=username]');		this.description = $('textarea[name=description]');		this.points=0;		this.date= new Date;	},	events: {		'click': 'addComment'	},	addComment: function(e) {		e.preventDefault();		this.collection.create({			username: this.username.val(),			description: this.description.val(),			points:0,			date: this.date		}, { wait: true });		this.clearForm();	},	clearForm: function() {		this.username.val('');		this.description.val('');	}});/*----------------------------------------------------------	All Comments View----------------------------------------------------------*/App.Views.Comments = Backbone.View.extend({	tagName: 'ul',		id: 'comments-list',		initialize: function() {		this.collection.on('add', this.addOne, this);		this.counter = $('#comment_count');	},	render: function() {		this.collection.each( this.addOne, this );		return this;	},	addOne: function(comment){		var commentView = new App.Views.Comment({ model: comment });		this.counter.text(this.collection.length);		this.$el.append(commentView.render().el);	}});/*----------------------------------------------------------	Single Comments View----------------------------------------------------------*/App.Views.Comment = Backbone.View.extend({	tagName: 'li',	template: template('comment-template'),	initialize: function() {		this.model.on('destroy', this.unrender, this);		this.model.on('change', this.render, this);		this.counter = $('#comment_count');	},	events: {		'click a.delete': 'deleteComment',		'click a.upvote'  : 'upvoteComment'	},	upvoteComment: function(ev){		var el = $(ev.currentTarget);		var score= el.parents('div.content').find('span.score');		var username= el.parents('div.content').find('a.author');		var description= el.parents('div.content').find('div.text');		this.model.save({			username: $.trim(username.text()),			description: $.trim(description.text()),			points: parseInt(score.text())+ 1,			date: new Date		},{ wait: true });	},	deleteComment: function() {		this.model.destroy();	},	render: function() {		var obj =this.model.toJSON();		obj.time_elapsed=$.timeago(obj.date); 		this.$el.html( this.template( obj ) );		return this;	},	unrender: function() {		this.remove();		this.counter.text(this.model.collection.length-1);	}});/*----------------------------------------------------------	Set up Route----------------------------------------------------------*/App.Router = Backbone.Router.extend({	routes: {		'': 'index'	},	index: function() {		//console.log( 'INDEX' );	}});/*----------------------------------------------------------	Deploy App----------------------------------------------------------*/new App.Router;Backbone.history.start();App.comments = new App.Collections.Comments;App.comments.fetch().then(function() {	new App.Views.App({ collection: App.comments });});