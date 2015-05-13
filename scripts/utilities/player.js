define([
    './movementStrategies/enumerate',
    'utilities/game-tile',
    'mout/lang/clone'
], function (
    movementStrategies,
    GameTile,
    clone
) { 
    var tileSize = GameTile.getTileSize();
    var tileWidth = tileSize.width;
    var tileHeight = tileSize.height;
    
    var playerCount = 0;
        
    var attachMovementStrategyFunctions = function attachMovementStrategyFunctions(movementStrategy) {
        movementStrategy.setStand(this, this.stand);
        movementStrategy.setMoveLeft(this, this.moveLeft);
        movementStrategy.setMoveRight(this, this.moveRight);
        movementStrategy.setClimbUp(this, this.climbUp);
        movementStrategy.setClimbDown(this, this.climbDown);
        movementStrategy.setJump(this, this.jump);
        movementStrategy.setDrop(this, this.drop);
    };
    
    var images = (function() {
        var imageDir = 'images/src/';
        var images = {
            "OPPONENT_STAND": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'stand_pink.png');
                    return image;
                })()
            ],
            "HUMAN_STAND": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'stand_yellow.png');
                    return image;
                })()
            ],
            "OPPONENT_RUN_LEFT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_pink_1.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_pink_2.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_pink_3.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_pink_4.png');
                    return image;
                })()
            ],
            "OPPONENT_RUN_RIGHT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_pink_1.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_pink_2.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_pink_3.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_pink_4.png');
                    return image;
                })()
            ],
            "HUMAN_RUN_LEFT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_yellow_1.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_yellow_2.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_yellow_3.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_yellow_4.png');
                    return image;
                })()
            ],
            "HUMAN_RUN_RIGHT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_yellow_1.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_yellow_2.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_yellow_3.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_yellow_4.png');
                    return image;
                })()
            ],
            "OPPONENT_CLIMB": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'climb_1_pink.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'climb_2_pink.png');
                    return image;
                })()
            ],
            "HUMAN_CLIMB": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'climb_1_yellow.png');
                    return image;
                })(),
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'climb_2_yellow.png');
                    return image;
                })()
            ],
            "OPPONENT_JUMP_LEFT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_pink_4.png');
                    return image;
                })()
            ],
            "OPPONENT_JUMP_RIGHT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_pink_4.png');
                    return image;
                })()
            ],
            "HUMAN_JUMP_LEFT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_left_yellow_4.png');
                    return image;
                })()
            ],
            "HUMAN_JUMP_RIGHT": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'run_right_yellow_4.png');
                    return image;
                })()
            ],
            "OPPONENT_FALL": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'fall_pink.png');
                    return image;
                })()
            ],
            "HUMAN_FALL": [
                (function() {
                    var image = new Image();
                    image.src = (imageDir + 'fall_yellow.png');
                    return image;
                })()
            ],
        };
        return images;
    })();
    
    var getImage = function getImage(playerType, posture, direction, alternate) {
        var imageKey = '';
        var image;
        var imageIndex;
        alternate = alternate || 0;
        
        if(playerType === Player.types.HUMAN) {
            imageKey += 'HUMAN';
        }
        else {
            imageKey += 'OPPONENT';
        }
        
        if(posture === Player.postures.RUN) {
            imageKey += '_RUN';
        }
        else if(posture === Player.postures.CLIMB) {
            imageKey += '_CLIMB';
        }
        else if(posture === Player.postures.JUMP) {
            imageKey += '_JUMP';
        }
        else if(posture === Player.postures.FALL) {
            imageKey += '_FALL';
        }
        else {
            imageKey += '_STAND';
        }
        
        if(direction === Player.directions.LEFT) {
            imageKey += '_LEFT';
        }
        else if(direction === Player.directions.RIGHT) {
            imageKey += '_RIGHT';
        }
        else {
            // intentionally blank because FORWARD and BACKWARD are posture specific and don't need image qualifiers
        }
        
        image = images[imageKey];
        
        if(image && image.length) {
            imageIndex = alternate % image.length;
            image = image[imageIndex];
        } else {
            image = new Image();
        }
        
        return image;
    };
    
    /**
     * Creates new Player
     * @class
     * todo: finish this JSDoc
     */
    var Player = function(opts) {
        var playerName;
        var playerMovementStrategyKey;
        var PlayerMovementStrategy;
        var playerInitialPosition;
        var playerType;
        var eventEmitter;
        
        if(opts instanceof Player) {
            return Player;
        }
        
        playerName = opts.name ;//|| throw new Error("No `playerName` provided!");
        playerMovementStrategyKey = opts.movementStrategy;// || throw new Error("No `playerMovementStrategy` provided!");
        playerInitialPosition = opts.initialPosition;// || throw new Error("No `playerInitialPosition` provided!");
        playerType = opts.type;// || throw new Error("No `playerType` provided!");
        playerNumExtraLives = opts.numExtraLives || 0;
        playerNumTelepods = opts.numTelepods || 0;
        eventEmitter = opts.eventEmitter; // || throw new Error("No `eventEmitter` provided!");
        if(!(playerInitialPosition.hasOwnProperty('x') && playerInitialPosition.hasOwnProperty('y'))) {
            throw new Error("Invalid initial position!");
        }
        if(!(PlayerMovementStrategy = movementStrategies[playerMovementStrategyKey])) {
            throw new Error("Invalid movement strategy, options are: ", movementStategies);
        }
        
        this._id = playerCount;
        this._name = playerName;
        this._movementStrategy = new PlayerMovementStrategy();
        this._position = {
            x: playerInitialPosition.x,
            y: playerInitialPosition.y,
            posture: Player.postures.STAND,
            direction: Player.directions.FORWARD
        }
        this._numTelepods = playerNumTelepods;
        this._numExtraLives = playerNumExtraLives;
        this._type = playerType;
        this._eventEmitter = eventEmitter;
        
        attachMovementStrategyFunctions.call(this, this._movementStrategy);
        
        playerCount++;
                
        return this;
    };
    
    Player.prototype.stand = function stand() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.STAND
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.moveLeft = function moveLeft() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.LEFT
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.moveRight = function moveRight() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.RIGHT
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.climbUp = function climbUp() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.CLIMB_UP
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.climbDown = function climbDown() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.CLIMB_DOWN
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.jump = function jump() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.JUMP
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.drop = function drop() {
        var moveDetails = {
            player: this._id,
            move: Player.moves.DROP
        }
        
        this._eventEmitter.emit('playerMoveRequest', moveDetails);
    };
    
    Player.prototype.getId = function getId() {
        return this._id;
    };
    
    Player.prototype.getType = function getType() {
        return this._type;
    };
    
    Player.prototype.setType = function stType(name) {
        this._type = type;
    };
    
    Player.prototype.getName = function getName() {
        return this._name;
    };
    
    Player.prototype.setName = function getName(name) {
        this._name = name;
    };
    
    Player.prototype.getNumTelepods = function getNumTelepods() {
        return this._numTelepods;
    };
    
    Player.prototype.setNumTelepods = function setNumTelepods(numTelepods) {
        this._numTelepods = numTelepods;
    };
    
    Player.prototype.getNumExtraLives = function getNumExtraLives() {
        return this._numExtraLives;
    };
    
    Player.prototype.setNumExtraLives = function setNumExtraLives(numExtraLives) {
        this._numExtraLives = numExtraLives;
    };
    
    Player.prototype.getPosition = function getPosition() {
        return clone(this._position);
    };
    
    Player.prototype.setPosition = function getName(position) {
        this._position = position;
    };
    
    /**
     * Renders the player
     * todo: finish this JSDoc
     */
    Player.prototype.render = function(context) {
        var offsetY = 8;
        var position = this._position;
        var image = getImage(this._type, position.posture, position.direction);
        context.drawImage(image, position.x * tileWidth, position.y * tileHeight + offsetY);
    };
    
    Player.types = {
        HUMAN: 0,
        OPPONENT: 1
    };
    Player.directions = {
        FORWARD: 0,
        BACKWARD: 1,
        LEFT: 2,
        RIGHT: 3
    };
    Player.moves = {
        STAND: 0,
        LEFT: 1,
        RIGHT: 2,
        CLIMB_UP: 3,
        CLIMB_DOWN: 4,
        JUMP: 5,
        DROP: 6
    };
    Player.postures = {
        STAND: 0,
        RUN: 1,
        CLIMB: 2,
        JUMP: 3,
        FALL: 4
    };
    
    return Player;
});