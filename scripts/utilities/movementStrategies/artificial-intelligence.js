define([
    'jquery',
    'mout/array/forEach',
    'mout/array/contains',
    'mout/array/union',
    'mout/array/intersection',
    'mout/array/difference',
    'mout/array/insert',
    'mout/array/remove',
    'mout/object/values',
    'mout/object/some'
], function (
    $,
    forEach,
    contains,
    union,
    intersection,
    difference,
    insert,
    remove,
    values,
    some
) { 
    var ArtificialIntelligenceMovementStrategy = function ArtificialIntelligenceMovementStrategy(eventEmitter) {
        var scope = this;
        var moveInterval = 250; // mS
        var callbacks = {};
        this.eventEmitter = eventEmitter;
        
        this.stand = function stand() {
            callbacks.stand && callbacks.stand.call(this);
        };
        this.moveLeft = function moveLeft() {
            callbacks.left && callbacks.left.call(this);
        };
        this.moveRight = function moveRight() {
            callbacks.right && callbacks.right.call(this);
        };
        this.climbUp = function climbUp() {
            callbacks.climbUp && callbacks.climbUp.call(this);
        };
        this.climbDown = function climbDown() {
            callbacks.climbDown && callbacks.climbDown.call(this);
        };
        this.jump = function jump() {
            callbacks.jump && callbacks.jump.call(this);
        };
        this.drop = function drop() {
            callbacks.drop && callbacks.drop.call(this);
        };
        
        this.setPlayerId = function setPlayerId(id) {
            this._playerId = id;
        };
        this.setPlayerIntelligence = function setPlayerIntelligence(intelligence) {
            this._intelligence = intelligence;
        };
        this.setStand = function setStand(player, cb) {
            callbacks.stand = function() {
                cb.call(player);
            }
        };
        this.setMoveLeft = function setMoveLeft(player, cb) {
            callbacks.left = function() {
                cb.call(player);
            }
        };
        this.setMoveRight = function setMoveRight(player, cb) {
            callbacks.right = function() {
                cb.call(player);
            };
        };
        this.setClimbUp = function setClimbUp(player, cb) {
            callbacks.climbUp = function() {
                cb.call(player);
            };
        };
        this.setClimbDown = function setClimbDown(player, cb) {
            callbacks.climbDown = function() {
                cb.call(player);
            };
        };
        this.setJump = function setJump(player, cb) {
            callbacks.jump = function() {
                cb.call(player);
            };
        };
        this.setDrop = function setDrop(player, cb) {
            callbacks.drop = function() {
                cb.call(player);
            };
        }
        
        eventEmitter.on('aiInfo', function(event) {
            scope._move.call(scope, event);
        });
        
        setInterval(function() {
            scope._requestInfo.call(scope);
        }, moveInterval);
    };
    
    ArtificialIntelligenceMovementStrategy.prototype._requestInfo = function _requestInfo() {
        var scope = this;
        var id = this._playerId;
        if(id) {
            this.eventEmitter.emit('aiInfoRequest', {
                player: id
            });
        }
    };
    
    ArtificialIntelligenceMovementStrategy.prototype._move = function _move(event) {
        var nearestLadder, ladders, preferLeft;
        var scope = this;
        var position = event.position;
        var target = event.nearestHuman;
        var laddersOnThisRow = event.laddersOnThisRow;
        var laddersOnLowerRow = event.laddersOnLowerRow;
        var madeMove = false;
                
        var getNearestLadder = function getNearestLadder(ladders, position, preferLeft) {
            var nearestPreferredDistance = null;
            var nearestPreferredLadder = null;
            var nearestUnpreferredDistance = null;
            var nearestUnpreferredLadder = null;
            forEach(ladders, function(ladder) {
                var difference = ladder.x - position.x;
                var distance = Math.abs(difference);
                var isLeft = (difference < 0);
                                
                // No XOR function :(
                if(distance === 0 || (isLeft && preferLeft) || (!isLeft && !preferLeft)) {
                    // Preferred direction of motion
                    if(!nearestPreferredLadder || distance < nearestPreferredDistance) {
                        nearestPreferredDistance = distance;
                        nearestPreferredLadder = ladder;
                    }
                }
                else {
                    // Unpreferred direction of motion
                    if(!nearestUnpreferredLadder || distance < nearestUnpreferredDistance) {
                        nearestUnpreferredDistance = distance;
                        nearestUnpreferredLadder = ladder;
                    }
                }
            });
            return nearestPreferredLadder || nearestUnpreferredLadder;
        }
        
        if(this._playerId != event.player) {
            return;
        }
                
        if(!target) {
            // No living humans
            return this.stand();
        }
        else if(position.y === target.y) {
            // On same level as target
            if(position.x < target.x) {
                // Left of target
                return this.moveRight();
            }
            else if(position.x > target.x) {
                return this.moveLeft();
            }
            else {
                return this.stand();
            }
        }
        else {
            // Use laders beneath you to move down or ladders on your row to move up
            ladders = (position.y < target.y) ? laddersOnLowerRow : laddersOnThisRow;
            // Prefer running toward a ladder in the opposite direction of your target
            preferLeft = (position.x < target.x + this._intelligence);
            nearestLadder = getNearestLadder(ladders, position, preferLeft);
            if(position.x < nearestLadder.x) {
                return this.moveRight();
            }
            else if(position.x > nearestLadder.x) {
                return this.moveLeft();
            }
            else {
                return (position.y < nearestLadder.y) ? this.climbDown() : this.climbUp();
            }
        }
    };
    
    return ArtificialIntelligenceMovementStrategy;
});