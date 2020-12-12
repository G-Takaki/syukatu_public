enchant();

window.onload = function() {
  var game = new Game(640,320);//画面サイズ
  //画像読み込み
  game.preload('img/chara1.png');
  game.preload('img/icon0.png');
  game.preload('img/virus2.png');
  game.preload('img/bar.png');
  game.preload('img/scale.png');
  game.preload('img/start.png');
  game.preload('img/end.png');
  game.preload('img/clear.png');
  game.preload('img/hare2.jpg');//晴
  game.preload('img/ame.jpg');//雨
  game.preload('img/kumori.jpg');//曇り
  game.preload('img/snow.jpg');//雪
  game.preload('img/thunderstorm.jpg');//雷
  game.preload('img/ijyou.jpg');//異常気象
  game.preload('img/titlename.jpg');
  game.preload('img/mask.png');

  game.fps=30;//1秒間に何回動くか

  //追加するキー
  game.keybind(90, 'z');

  //処理開始
  game.onload=function() {

    //--------------背景------------------------------------------------
    var background = new Sprite(640,320);
    weather_api();//天気読み取り
    game.rootScene.addChild(background);
    //-------------------------------------------------------------------

//-----------------クラス-----------------------------------------------
    //敵のクラス
    enemies = [];
    var Enemy = Class.create(Sprite,{
      //初期化
      initialize: function(x,y){
        Sprite.call(this, 45, 100);//画像大きさ
        //出現する座標
        this.x = x;
        this.y = y;
        this.frame = 0;//画像の中のどの画像か
        this.image = game.assets['img/virus2.png'];//画像
        game.rootScene.addChild(this);//表示
        enemies[enemies.length]=this;
      },
      onenterframe:function(){//処理
        this.x -= 5;//左に進むスピード
        this.y += Math.sin(this.age*0.1);//上下に動く
        //ライフゲージ減少
        if(player.within(this, 20) && muteki == 0) {
          for(var i = 0;i<2;i++){
            Emeter.removeChild(Emeter.lastChild);
          }
          Emeter.num -= 2;
          if (Emeter.num == 0){//ゲームオーバー画面に移行

            //-----------データベース保存--------------------------
            var result = {"username":username,"score":-1};
            $.ajax({
                type: "POST",
                url: "post4.php",
                async: true,
                data:result
            });
            //-----------------------------------------------------

            game.pushScene(gameoverscene);
          }
        }

      }
    });


    //弾のクラス
    game.score = 0;
    var Shot = Class.create(Sprite,{
      //初期化
      initialize: function(x,y){
        Sprite.call(this, 16, 16);//画像大きさ
        //出現する座標
        this.x = x;
        this.y = y;

        this.frame = 54;//画像の中のどの画像か
        this.image = game.assets['img/icon0.png'];//画像
        game.rootScene.addChild(this);//表示
      },
      onenterframe:function(){//処理
        this.x += 30;
        for(var i=0,len=enemies.length;i<len;i++){
          if(this.within(enemies[i],20) && enemies[i] != 0 && time.time>=0){//当たり判定
            game.rootScene.removeChild(enemies[i]);
            enemies[i] = 0;
            game.score = game.score + 10;
          }
        }
      }
    });

    //プレイヤーのクラス
    countershot = 0;
    var Player = Class.create(Sprite,{
      //初期化
      initialize: function(x,y){
        Sprite.call(this, 32, 32);
        //出現する座標
        this.x = x;
        this.y = y;

        this.frame = 0;//画像の中のどの画像か
        this.image = game.assets['img/chara1.png'];//画像
        game.rootScene.addChild(this);//表示
      },
      onenterframe:function(){//処理
        if(game.input.z){//zキーが押されたら、弾が出る
          countershot += 1;
          if(countershot % 5 == 0){
            var shot = new Shot(this.x+25,this.y+15);//this.x+25,this.y+15は弾がどこからでるか
          }
        }
      }
    });

    //----------------------------無敵アイテム------------------------------------------
    var muteki = 0;
    var Mask = Class.create(Sprite,{
      //初期化
      initialize: function(x,y){
        Sprite.call(this, 50, 40);//画像大きさ
        //出現する座標
        this.x = x;
        this.y = y;
        this.frame = 0;//画像の中のどの画像か
        this.image = game.assets['img/mask.png'];//画像
        game.rootScene.addChild(this);//表示
      },
      onenterframe:function(){//処理
        this.x -= 5;
        if(this.within(player,20) && time.time>=0){//当たり判定
          muteki = muteki + 3;//無敵時間
          console.log(muteki);
          game.rootScene.removeChild(this);
        }

      }
    });
    console.log(muteki);
    //---------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------

//--------------プレイヤーの操作-----------------------------------------------------------------------
    player=new Player(0,160);//プレイヤー
    player.addEventListener('enterframe',function(){//毎フレームごとの処理
      this.frame = 0;//静止の画像
      if(game.input.right){//右キーがおされたら、右に移動
        if (this.scaleX==-1){//反対側を向いていたら正しい方向に直す
          this.scaleX = 1;
        }
        this.frame = this.age % 3;
        if(this.x < 600){
          this.x += 5;
        }
      }
      if(game.input.left){//左キーがおされたら、左に移動
        if (this.scaleX==1){//反対側を向いていたら正しい方向に直す
          this.scaleX = -1;
        }
        this.frame = this.age % 3;
        if(this.x > 0){
          this.x -= 5;
        }
      }
      if(game.input.up){//上キーがおされたら、上に移動
        this.frame = this.age % 3;
        if(this.y > 0){
          this.y -= 5;
        }
      }
      if(game.input.down){//下キーがおされたら、下に移動
        this.frame = this.age % 3;
        if(this.y < 300){
          this.y += 5;
        }
      }
    });

    game.rootScene.addChild(player);//プレイヤー表示
//-------------------------------------------------------------------------------------

//--------------------制限時間---------------------------------------------------------
    var time = new MutableText(10,10);
    time.time = 30;
    time.text = 'TIME:' + time.time;
    game.rootScene.addChild(time);

    game.rootScene.addEventListener('enterframe', function(){
      if(game.frame % game.fps == 0){
        time.time = time.time -1;
        time.text = 'TIME:' + time.time;

        //--------------------無敵時間-------------------------------------
        if(muteki > 0){
          muteki = muteki - 1;
          console.log(muteki);
        }
        //------------------------------------------------------------------

        if(time.time == 0){

          //--------------データベースに保存-------------------
          var result = {"username":username,"score":game.score};
          $.ajax({
              type: "POST",
              url: "post4.php",
              async: true,
              data:result
          });
          //------------------------------------------------

          //-----------------------クリア画面-------------------------------------------
          var clearscene = new Scene();
          clearscene.backgroundColor = 'black';

          var clearimage = new Sprite(267, 48);
          clearimage.image = game.assets['img/clear.png'];
          clearimage.x = 190;
          clearimage.y = 120;
          clearscene.addChild(clearimage);

          var scoredisplay = new Label();
          scoredisplay.x = 190;
          scoredisplay.y = 200;
          scoredisplay.font = '25px "Arial"';
          scoredisplay.color = "WHITE";
          scoredisplay.text = "YOUR SCORE:"+game.score;
          clearscene.addChild(scoredisplay);

          var clickreload2 = new Label();
          clickreload2.x = 190;
          clickreload2.y = 250;
          clickreload2.font = '25px "Arial"';
          clickreload2.color = "Yellow";
          clickreload2.text = "クリックしてリスタート";
          clearscene.addChild(clickreload2);

          clickreload2.addEventListener("touchstart", function(){
            location.reload();
          });

          var clickrank1 = new Label();
          clickrank1.x = 190;
          clickrank1.y = 280;
          clickrank1.font = '25px "Arial"';
          clickrank1.color = "Yellow";
          clickrank1.text = "クリックしてランキングへ";
          clearscene.addChild(clickrank1);

          clickrank1.addEventListener("touchstart", function(){
             get();
          });

          //---------------------------------------------------------------------------

          game.pushScene(clearscene);
        }

      }
    });

//-----------------------------------------------------------------------------------

//------------------ スコア-------------------------------------------------------
    var score = new MutableText(10,30);
    score.text = 'SCORE:' + game.score;
    game.rootScene.addChild(score);

    game.rootScene.addEventListener('enterframe', function(){
      score.text = 'SCORE:' + game.score;
    });
//--------------------------------------------------------------------------------

//------------------体力ゲージ----------------------------------------------------
  var Emeter = new Group();
  Emeter.x = 100;
  Emeter.y = 5;
  Emeter.num = 50;//maxの体力
  var Ebar = new Sprite(54,15);
  Ebar.image = game.assets['img/bar.png'];
  Ebar.x = 50;
  Emeter.addChild(Ebar);
  for(var i=0;i<Emeter.num;i++){
    var scale = new Sprite(1,11);
    scale.image = game.assets['img/scale.png'];
    scale.x = Ebar.x + 2 + i;//2=バーの左部分、i=ゲージ部分
    scale.y = 2;
    Emeter.addChild(scale);
  }
  game.rootScene.addChild(Emeter);
//-------------------------------------------------------------------------------

//-------------------- 敵・アイテム表示---------------------------------------------
    game.rootScene.addEventListener('enterframe', function () {

      if(time.time>=0){//何秒間出続けるか指定

        //------------------敵表示----------------------------------------------
        if(game.frame%2==0){//1フレームごとに表示
          largeenemies=new Enemy(rand(200,640),rand(0,270));//どこから出現するか
        }
        //----------------------------------------------------------------------

        //---------------マスク配布----------------------------------------
        if(game.frame%160==0){//1フレームごとに表示
          masks=new Mask(rand(200,640),rand(0,300));//どこから出現するか
        }
        //------------------------------------------------------------------
        score.score = game.score;//時間内はスコアを更新
      }
    });
//-------------------------------------------------------------------------------

//------------スタート画面-------------------------------------------------------
    var startscene = new Scene();
    startscene.backgroundColor = 'black';

    var startimage = new Sprite(236, 48);
    startimage.image = game.assets['img/start.png'];
    startimage.x = 200;
    startimage.y = 190;
    startscene.addChild(startimage);

//------------ウイルスバスターズ----------------------------
    var titlename = new Sprite(200,160);
    titlename.image = game.assets['img/titlename.jpg'];
    titlename.x = 210;
    titlename.y = 20;
    startscene.addChild(titlename);
//----------------------------------------------------

    //-------スタートボタン-------------------------
    var clickrule = new Label();
    clickrule.x = 190;
    clickrule.y = 250;
    clickrule.font = '25px "Arial"';
    clickrule.color = "Yellow";
    clickrule.text = "クリックして説明画面へ";
    startscene.addChild(clickrule);
    //--------------------------------------------

    //--------入力フォーム---------------------------
    var input = new Entity();
    input._element = document.createElement('input');
    input._element.setAttribute('type','text');
    input._element.setAttribute('maxlength','10');
    input._element.setAttribute('id','test');
    input._element.setAttribute('value','');
    input._element.setAttribute('placeholder','enter username');
    input.width = 100;
    input.height = 10;
    input.x = 270;
    input.y = 280;
    startscene.addChild(input);
    //----------------------------------------------

    clickrule.addEventListener("touchstart", function(){
      username = input._element.value;
      if (username==""){
        username = "no name";
      }
      game.removeScene(startscene);
      game.pushScene(rulescene);
    });

    game.pushScene(startscene);
//-----------------------------------------------------------------------------

//-------------------ゲームオーバー画面-----------------------------------------
    var gameoverscene = new Scene();
    gameoverscene.backgroundColor = 'black';

    var gameoverimage = new Sprite(189, 97);
    gameoverimage.image = game.assets['img/end.png'];
    gameoverimage.x = 220;
    gameoverimage.y = 100;
    gameoverscene.addChild(gameoverimage);

    var clickreload1 = new Label();
    clickreload1.x = 190;
    clickreload1.y = 250;
    clickreload1.font = '25px "Arial"';
    clickreload1.color = "Yellow";
    clickreload1.text = "クリックしてリスタート";
    gameoverscene.addChild(clickreload1);

    clickreload1.addEventListener("touchstart", function(){
	     location.reload();
    });

    var clickrank2 = new Label();
    clickrank2.x = 190;
    clickrank2.y = 280;
    clickrank2.font = '25px "Arial"';
    clickrank2.color = "Yellow";
    clickrank2.text = "クリックしてランキングへ";
    gameoverscene.addChild(clickrank2);

    clickrank2.addEventListener("touchstart", function(){
	     get();
    });
//-----------------------------------------------------------------------------

//---------------ランキング画面----------------------------------------------------

    //----------データベースからスコア読み取り--------------------
    function get(){
        var data1;
        var data2;
        var data3;

        $.ajax({
            type: "POST",
            url: "get6.php",
            async : true,
            data: {"data1": data1},
            success: function(data1){
          	   console.log(data1);
               var rank1 = new Label();//1位
               rank1.x = 160;
               rank1.y = 90;
               rank1.font = '15px "Arial"';
               rank1.color = "white";
               rank1.text = "1. " + data1;

               $.ajax({
                   type: "POST",
                   url: "get7.php",
                   async : true,
                   data: {"data2": data2},
                   success: function(data2){
                     console.log(data2);
                      var rank2 = new Label();//2位
                      rank2.x = 160;
                      rank2.y = 120;
                      rank2.font = '15px "Arial"';
                      rank2.color = "white";
                      rank2.text = "2. " + data2;

                      $.ajax({
                          type: "POST",
                          url: "get8.php",
                          async : true,
                          data: {"data3": data3},
                          success: function(data3){
                        	   console.log(data3);
                             var rank3 = new Label();//3位
                             rank3.x = 160;
                             rank3.y = 150;
                             rank3.font = '15px "Arial"';
                             rank3.color = "white";
                             rank3.text = "3. "+ data3;

                             var rankscene = new Scene();
                             rankscene.backgroundColor = 'black';
                             rankscene.addChild(rank1);
                             rankscene.addChild(rank2);
                             rankscene.addChild(rank3);

                             var ranktitle = new Label();//タイトル
                             ranktitle.x = 160;
                             ranktitle.y = 50;
                             ranktitle.font = '25px "Arial"';
                             ranktitle.color = "white";
                             ranktitle.text = "ランキング";
                             rankscene.addChild(ranktitle);

                             var clickreload3 = new Label();
                             clickreload3.x = 190;
                             clickreload3.y = 250;
                             clickreload3.font = '25px "Arial"';
                             clickreload3.color = "Yellow";
                             clickreload3.text = "クリックしてタイトル画面へ";
                             rankscene.addChild(clickreload3);

                             clickreload3.addEventListener("touchstart", function(){
                         	     location.reload();
                             });

                             game.pushScene(rankscene);

                          }
                      });
                   }
               });
            }
        });


    }
    //-----------------------------------------------------------
//--------------------------------------------------------------------------------

//-------------------ルール説明画面-------------------------------------------
    var rulescene = new Scene();
    rulescene.backgroundColor = 'black';

    //--------------ルール説明--------------------------------
    var ruletitle = new Label();//タイトル
    ruletitle.x = 160;
    ruletitle.y = 50;
    ruletitle.font = '25px "Arial"';
    ruletitle.color = "white";
    ruletitle.text = "ルール説明";
    rulescene.addChild(ruletitle);

    var rule1 = new Label();//ルール1
    rule1.x = 160;
    rule1.y = 90;
    rule1.font = '15px "Arial"';
    rule1.color = "white";
    rule1.text = "1. このゲームはウイルスを除菌するゲームである";
    rulescene.addChild(rule1);

    var rule2 = new Label();//ルール2
    rule2.x = 160;
    rule2.y = 140;
    rule2.font = '15px "Arial"';
    rule2.color = "white";
    rule2.text = "2. 方向キーで移動する";
    rulescene.addChild(rule2);

    var rule3 = new Label();//ルール3
    rule3.x = 160;
    rule3.y = 170;
    rule3.font = '15px "Arial"';
    rule3.color = "white";
    rule3.text = "3. zキーでワクチン発射";
    rulescene.addChild(rule3);

    var rule4 = new Label();//ルール4
    rule4.x = 160;
    rule4.y = 200;
    rule4.font = '15px "Arial"';
    rule4.color = "white";
    rule4.text = "4. マスクをとると3秒間無敵";
    rulescene.addChild(rule4);

    var rule5 = new Label();//ルール4
    rule5.x = 160;
    rule5.y = 230;
    rule5.font = '15px "Arial"';
    rule5.color = "white";
    rule5.text = "5. 制限時間は30秒";
    rulescene.addChild(rule5);

    var clickstart = new Label();
    clickstart.x = 180;
    clickstart.y = 280;
    clickstart.font = '25px "Arial"';
    clickstart.color = "Yellow";
    clickstart.text = "---クリックしてスタート---";
    rulescene.addChild(clickstart);

    clickstart.addEventListener("touchstart", function(){
      game.removeScene(rulescene);
    });

//---------------------------------------------------------------------------

//------------------------Web API--------------------------------------------
    var weather;
    //東京の天気を取得
    function weather_api() {
      var API_KEY = '260d1ae9854f1332aa232917016fc1d8'
      var city = 'Tokyo';
      var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + ',jp&units=metric&APPID=' + API_KEY;
      $.ajax({
        url: url,
        dataType: "json",
        cache: true,
        type: 'GET',
        success: function(data){
          console.log(data);
          weather = data.weather[0].main;

          //------------背景画像決定------------------------------------
          if (weather=='Clear'){//晴
            background.image = game.assets['img/hare2.jpg'];
            console.log(weather);
          }else if(weather=='Clouds'){//曇り
            background.image = game.assets['img/kumori.jpg'];
            console.log(weather);
          }else if(weather=='Rain' || weather=='Drizzle' || weather=='Squall'){//雨
            background.image = game.assets['img/ame.jpg'];
            console.log(weather);
          }else if(weather=='Snow'){//雪
            background.image = game.assets['img/snow.jpg'];
            console.log(weather);
          }else if(weather=='Thunderstorm'){//雷
            background.image = game.assets['img/thunderstorm.jpg'];
            console.log(weather);
          }else{
            background.image = game.assets['img/ijyou.jpg'];
            console.log(weather);
          }
          //-----------------------------------------------------------

        }
      });
    }
//---------------------------------------------------------------------------

  }
  game.start();
};

function rand(m,n){//乱数生成
  return Math.floor(Math.random()*(n+1))+m;
}
