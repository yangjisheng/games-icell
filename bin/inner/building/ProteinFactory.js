yc.inner.building.ProteinFactory = yc.inner.building.Building.extend({  
	//
	composition_progress: 0
	
	, working_formula: null 
	
	// 合成效率，每秒合成 5 个氨基酸
	, composition_efficient: 5

	, ctor: function(){
		this._super() ;

		this.timeout = null ;

		// 执行动画
        this.runAction(cc.RepeatForever.create(
	       	yc.animations.createAction('towers.mage_lvl1')
        ));

       	this.setAnchorPoint(cc.p(0.5,0.4)) ;
	}

	, put: function(hexgon){
		
		this._super(hexgon)
		
		// 开始合成
		this.startComposite() ;
		
		return yc.inner.building.Tower ;
	}
	
	, startComposite: function(){
		
		// 停止
		if( this.bStop )
		{
			return ;
		}

		var factory = this ;
		
		
		var loopStart = this.working_formula? this.working_formula: ins(yc.user.ProteinFormulas).last ;
		if(!loopStart)
		{
			return ;
		}

		var formula = loopStart ;
		this.working_formula = null ;
		
		do{
			var formula = formula.next ;
			
			// 检查状态
			if(formula.status!='compositing')
			{
				continue ;
			}
			
			// 检查氨基酸
			if(!this.checkingMaterials(formula))
			{
				// formula.ui.find('.formula-msg').text('原料不足').show() ;
				continue ;
			}
			else
			{
				// formula.ui.find('.formula-msg').text('暂停').hide() ;
			}
				
			this.working_formula = formula ;
			break ;
			
		}while(formula!==loopStart) ;

		if(!this.working_formula)
		{
			this.runAction( yc.actions.Timer.create(1, 1, factory, factory.startComposite) ) ;
			return ;   
		}
		
		// 开始合成过程
		// var freq = Math.round( 1 * (this.working_formula.total / this.composition_efficient) / 10) ;
		var freq = Math.round( 1000 * (this.working_formula.total / this.composition_efficient) / 10) ;
	   
		this.composition_progress = 0 ;
		// this.working_formula.ui.find('.protein-composite-progress').show().progressbar({value:0}) ;
		// this.working_formula.status = 'compositing' ;
		
		// 禁用暂停按钮
		// this.working_formula.ui.find('.protein-formula-togglebtn').attr('disabled',true) ;
			
		// 消耗氨基酸
		for(var key in formula.materials)
		{
			ins(yc.user.Character).aminoacids.increase(key,-formula.materials[key]) ;
		}

		var func = function(){

			// 停止
			if( factory.bStop )
			{
				return ;
			}

			// factory.composition_progress+= 10000 ;			
		  	factory.composition_progress+= 10 ;			
			// factory.working_formula.ui.find('.protein-composite-progress').show().progressbar({value:factory.composition_progress}) ;
			
			// 
			if( factory.composition_progress<100 )
			{
				this.runAction( yc.actions.Timer.create(freq/1000, 1, factory, func) ) ;
			}
			
			// 完成
			else
			{
				// factory.working_formula.status = 'pause' ;
				// factory.working_formula.ui.find('.protein-composite-progress').hide() ;
				
				// 增加蛋白质池中的存数
				ins(yc.user.Character).proteins.increase(factory.working_formula.name,1) ;
				
				// 恢复暂停按钮
				// factory.working_formula.ui.find('.protein-formula-togglebtn').attr('disabled',false) ;
		
				// next
				if(factory.working_formula.status == 'compositing'){
					factory.startComposite() ;
				}
				/*setTimeout(function(){
					
					// next
					factory.startComposite() ;
					
				},freq) ;*/
			}
		}

		this.runAction( yc.actions.Timer.create(freq/1000, 1, this, func) ) ;
	}

	, singleComposite : function(formula){
		// 检查氨基酸
		if(!this.checkingMaterials(formula))
		{
			// formula.ui.find('.formula-msg').text('原料不足').show() ;
			return;
		}
		else
		{
			// formula.ui.find('.formula-msg').text('暂停').hide() ;
		}

		// 消耗氨基酸
		for(var key in formula.materials)
		{
			ins(yc.user.Character).aminoacids.increase(key,-formula.materials[key]) ;
		}

		// 增加蛋白质池中的存数
		ins(yc.user.Character).proteins.increase(formula.name,1) ;
	}

	, checkingMaterials : function(formula){
		for(var key in formula.materials)
		{
			if(ins(yc.user.Character).aminoacids[key] < formula.materials[key])
			{
				return false ;
			}
		}
		return true ;
	}

}) ;


yc.inner.building.ProteinFactory.upgraders = [] ;

yc.inner.building.ProteinFactory.block = true ;
