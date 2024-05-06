class Elements {
  static originalHead = document.getElementById("head")
  static originalBackOfHead = document.getElementById("head-back");
  static originalFace = document.getElementById("face");

  static head = document.getElementById("head");
  static backOfHead = document.getElementById("head-back");
  static face = document.getElementById("face");
  static nose = document.getElementById("nose");
  static eyes = document.getElementsByClassName("eye");
  static mouth = document.getElementById("mouth");
  static arms = document.getElementsByClassName("arm");
  static leftArm = document.getElementsByClassName("left-arm")[0];
  static rightArm = document.getElementsByClassName("right-arm")[0];
  static body = document.getElementById("body");
  static legs = document.getElementsByClassName("leg");
  static leftLeg = document.getElementsByClassName("left-leg")[0];
  static rightLeg = document.getElementsByClassName("right-leg")[0];
  static panel = document.getElementById("control-panel");
  static balloonStructure = document.getElementById("balloon-structure");
  static balloon = document.getElementById("balloon");
}

class Sounds {
  static hello = new Audio("sounds/hello.wav");
  static buzz = new Audio("sounds/buzz.ogg");
  static doorWarning = new Audio("sounds/openingDoorsVoice.wav");
  static door = new Audio("sounds/door.wav");
  static move = new Audio("sounds/walk.wav");
}

const [button1, button2, button3, button4, button5, button6, button7, button8, button9] 
  = document.getElementsByClassName("button");

class Funcs {
  // static quarter1Func = (container, originalWidth, step) => {
  //   container.style.width = `${originalWidth - (0.5 * step/90 * originalWidth)}px`;
  //   container.getElementsByClassName("front")[0].style.width = `${originalWidth - (step/90 * originalWidth)}px`;
  // }

  // static quarter2Func = (container, originalWidth, step) => {
  //   container.style.width = `${0.5 * originalWidth * (1 + step/90)}px`;
  //   container.getElementsByClassName("back")[0].style.width = `${step/90 * originalWidth}px`;
  // }

  // static quarter3Func = (container, originalWidth, step) => {
  //   container.style.width = `${originalWidth - (0.5 * step/90 * originalWidth)}px`;
  //   container.getElementsByClassName("back")[0].style.width = `${originalWidth * (1 - step/90)}px`;
  // }

  // static quarter4Func = (container, originalWidth, step) => {
  //   container.style.width = `${0.5 * originalWidth * (1 + step/90)}px`;
  //   container.getElementsByClassName("front")[0].style.width = `${step/90 * originalWidth}px`;
  // }
}

class Direction {
  static clockwise = "clockwise";
  static anticlockwise = "anticlockwise";
  static up = "up";
  static down = "down";
}

class Position {
  static top = "left";
  static bottom = "bottom";
  static left = "left";
  static right = "right";
}

class State {
  constructor() {
    this.rotation = 0;
  }
}

const rand = max => Math.floor(Math.random() * Math.floor(max));
const mod = (i, n) => (i % n + n) % n;
const degrees = deg => deg;

let robotState = {
  head: new State()
}

class IntervalBuilder {
  constructor() { 
    this.counter = 0;
    this.counterUpdateFunc = counter => counter += 1;
    this.initialActions = [];
    this.actions = [];
    this.interval = 30;
    this.closeCondition = () => 0;
    this.finalActions = [];
    // this.asyncActions = [];
    this.params = {};
  }

  WithParameters(params) {
    this.params = {...this.params, ...params};
    return this;
  }

  First(initialActions) {
    this.initialActions = Array.isArray(initialActions) ? initialActions : [initialActions];
    return this;
  }

  StartingCounterAt(counter) {
    this.counter = counter;
    return this;
  }

  UpdateCounterAs(counterUpdateFunc) {
    this.counterUpdateFunc = counterUpdateFunc;
    return this;
  }

  EveryMilliseconds(interval) {
    this.interval = interval;
    return this;
  }

  Do(actions) {
    this.actions = Array.isArray(actions) 
      ? [...this.actions, ...actions] 
      : [...this.actions, actions];

    return this;
  }

  Until(closeCondition) {
    this.closeCondition = closeCondition;
    return this;
  }

  Finally(finalActions) {
    Array.isArray(finalActions) 
      ? this.finalActions = finalActions
      : this.finalActions.push(finalActions)

    return this;
  }

  BuildTemplate() {
    return () => {
      var intervalBuilder = new IntervalBuilder();
      intervalBuilder.counter = this.counter;
      intervalBuilder.counterUpdateFunc = this.counterUpdateFunc;
      intervalBuilder.initialActions = this.initialActions;
      intervalBuilder.actions = this.actions;
      intervalBuilder.closeCondition = this.closeCondition;
      intervalBuilder.interval = this.interval;
      intervalBuilder.finalActions = this.finalActions;
      intervalBuilder.params = this.params;
      
      return intervalBuilder;
    }
  }

  Build() {
    const emptyFunction = () => 0;

    return (intervalTree = emptyFunction) => {

      console.log(intervalTree);

      let counter = this.counter;
      const counterUpdateFunc = this.counterUpdateFunc;
      const initialActions = this.initialActions;
      const actions = this.actions;
      const isComplete = this.closeCondition;
      const interval = this.interval;
      const finalActions = this.finalActions;
      const params = this.params;

      initialActions.forEach(action => action(params));

      const intervalSetting = setInterval(function() {
        actions.forEach(action => action(counter, params))
        counter = counterUpdateFunc(counter);

        if (isComplete(counter, params)) {
          clearInterval(intervalSetting);

          finalActions.forEach(action => action(params));

          Array.isArray(intervalTree) 
            ? intervalTree.forEach(interval => interval())
            : intervalTree();
        }
      }, interval);
    }
  }
}

// Intervals:

const flashEyesInterval = new IntervalBuilder()
  .EveryMilliseconds(50)
  .First(_ => Sounds.buzz.play())
  .Do(index => [...Elements.eyes].forEach(eye => 
      eye.style.backgroundColor = "red orange yellow".split(" ")[index % 2]))
  .Until(index => index == 10)
  .Finally(() => [...Elements.eyes].forEach(eye => eye.style.backgroundColor = "purple"))
  .Build();

const raiseArmsInterval = new IntervalBuilder()
  .EveryMilliseconds(1)
  .First(_ => Sounds.move.play())
  .Do(rotation => [...Elements.arms].forEach(arm => arm.style.transform = 
      `rotate(${ arm.classList.contains("left-arm") ? "" : "-" }${ rotation / 2 }deg)`))
  .Until(rotation => rotation == 360)
  .Finally(rotation => [...Elements.arms].forEach(arm => arm.style.transform = `rotate(0deg)`))
  .Build();

const openPanelInterval = new IntervalBuilder()
  .First([
      _ => Sounds.doorWarning.play(),
      _ => Sounds.door.play(),
      _ => Elements.balloonStructure.style.visibility = "visible"])
  .EveryMilliseconds(22)
  .Do(gap => Elements.panel.style.marginLeft = `${gap}px`)
  .Until(gap => gap > 105)
  .Build();

const closePanelInterval = new IntervalBuilder()
  .First(_ => Sounds.door.play())
  .EveryMilliseconds(22)
  .Do(gap => Elements.panel.style.marginLeft = `${ 100 - gap }px`)
  .Until(gap => gap > 100)
  .Build();

const releaseBalloon = new IntervalBuilder()
  .Do(counter => Elements.balloonStructure.style.bottom = `${ counter  * 4 }px`)
  .Until(counter => counter >= 80)
  .Finally(_ => Elements.balloon.style.backgroundColor = 
              `rgb(${rand(255)}, ${rand(255)}, ${rand(255)})`)
  .Build();

  function horizontalTurn(element, direction, degrees, originalWidth) {
    return new IntervalBuilder()
      .First(_ => Sounds.move.play())
      .EveryMilliseconds(1)
      .UpdateCounterAs(counter => direction == Direction.clockwise ? counter += 1 : counter -= 1)
      .Do((counter, params) => horizontalTurnTrack[mod(counter + 90, 360)]
          .forEach(func => func(element, originalWidth, direction)))
      .Until((counter, params) => Math.abs(counter) >= degrees)
      .Build();
  } 
  
  function verticalTurn(element, direction, degrees, originalWidth) {
    return new IntervalBuilder()
      .First(_ => Sounds.move.play())
      .EveryMilliseconds(1)
      .UpdateCounterAs(counter => direction == Direction.up ? counter += 1 : counter -= 1)
      .Do((counter, params) => verticalTurnTrack[mod(counter + 90, 180)]
          .forEach(func => func(element, originalWidth, direction)))
      .Until((counter, params) => Math.abs(counter) >= degrees)
      .Build();
  } 

  const duggeeDance = new IntervalBuilder()
    .EveryMilliseconds(150)
    .Do((counter, params) => {
      console.log(counter);

      if (counter % 2 == 0) {
        Elements.leftLeg.style.height = "75px";
        Elements.rightLeg.style.height = "150px";
      }

      if (counter % 2 == 1) {{
        Elements.leftLeg.style.height = "150px";
        Elements.rightLeg.style.height = "75px";
      }}
    })
    .Until((counter, params) => counter == 10)
    .Finally(_ => [...Elements.legs].forEach(leg => leg.style.height = "150px"))
    .Build();

// ROTATION FUNCTIONALITY

function rotateVertically180Degrees(className) {
  return (container, originalHeight, step) => {
    container.style.height = `${originalHeight - (0.5 * Math.abs(90-step)/90 * originalHeight)}px`;
    container.getElementsByClassName(className)[0].style.height = `${originalHeight - (Math.abs(90-step)/90 * originalHeight)}px`;
  }
}

function rotateHorizontally180Degrees(className) {
  return (container, originalWidth, step) => {
    container.style.width = `${originalWidth - (0.5 * Math.abs(90-step)/90 * originalWidth)}px`;
    container.getElementsByClassName(className)[0].style.width = `${originalWidth - (Math.abs(90-step)/90 * originalWidth)}px`;
  }
}

// ORBIT FUNCTIONALITY

// function orbitYAxis180Degrees(className) {
//   return (orbitElement) => {
//     let satellites = orbitElement.childNodes;
//     // satellites.forEach(satellite => )
//   }
// }

function toggleLeftRightAnchor(className) {
  return (container, originalWidth, direction) => {
    let element = container.getElementsByClassName(className)[0];
    element = element.style.left == "0px" ? set(element, Position.right) : set(element, Position.left); 
  }
}

function toggleTopBottomAnchor(className) {
  return (container, originalWidth, direction) => {
    let element = container.getElementsByClassName(className)[0];
    element = element.style.top == "0px" ? set(element, Position.bottom) : set(element, Position.top); 
  }
}

function prepareTrackFunc(totalSteps) {
  const prepareTrack = (action, step = 0) => {
    var angleConfigurations = [
      [(container, originalWidth, direction) => action(container, originalWidth, step)]];
    
    return step != totalSteps
      ? angleConfigurations.concat(prepareTrack(action, step + 1))
      : angleConfigurations;
  };

  return prepareTrack;
}

const prepareQuarter = prepareTrackFunc(degrees(90));
const prepareHalfTurn = prepareTrackFunc(degrees(180));

const horizontalTurnTrack = populateHorizontalTurnTrack();
const verticalTurnTrack = populateVerticalTrack();

// function updateSatellites() {
//   return orbitContainer => {
//     let satellites = orbitContainer.chileNodes;
//     satellites.forEach(satellite => )
//   }
// }

function populateVerticalTrack() {
  return prepareHalfTurn(rotateVertically180Degrees("front"))
    .map((funcs, i) => i == 90 ? funcs.concat(toggleTopBottomAnchor("front")) : funcs );
}

function populateHorizontalTurnTrack() {
  var frontHalfTurn = prepareHalfTurn(rotateHorizontally180Degrees("front"));
  var backHalfTurn = prepareHalfTurn(rotateHorizontally180Degrees("back"));

  const track = [...frontHalfTurn, ...backHalfTurn];

  track[90].push((container, originalWidth, direction) => {
    var front = container.getElementsByClassName("front")[0];
    var back = container.getElementsByClassName("back")[0];
    front = direction == Direction.clockwise ? set(front, Position.left) : set(front, Position.right);
    back = direction == Direction.clockwise ? set(back, Position.right) : set(back, Position.left);
  });

  track[180].push((container, originalWidth, direction) => {
    var front = container.getElementsByClassName("front")[0];
    var back = container.getElementsByClassName("back")[0];
    front.style.visibility = direction == Direction.clockwise ? "hidden" : "visible"; 
    back.style.visibility = direction == Direction.clockwise ? "visible" : "hidden";
  });

  track[270].push((container, originalWidth, direction) => {
    var front = container.getElementsByClassName("front")[0];
    var back = container.getElementsByClassName("back")[0];
    front = direction == Direction.clockwise ? set(front, Position.right) : set(front, Position.left);
    back = direction == Direction.clockwise ? set(back, Position.left) : set(back, Position.right);
  });

  track[0].push((container, originalWidth, direction) => {
    var front = container.getElementsByClassName("front")[0];
    var back = container.getElementsByClassName("back")[0];
    front.style.visibility = direction == Direction.clockwise ? "visible" : "hidden"; 
    back.style.visibility = direction == Direction.clockwise ? "hidden" : "visible";
  })
  
  return track;
}

function set(element, position) {
  if (position == Position.top) {
    element.style.top = "0";
    element.style.bottom = null;
  }

  if (position == Position.bottom) {
    element.style.top = null;
    element.style.bottom = "0";
  }

  if (position == Position.left) {
    element.style.left = "0";
    element.style.right = null;
  }

  if (position == Position.right) {
    element.style.left = null;
    element.style.right = "0";
  }

  return element;
}

// SYCHRONOUS INTERVALS

const releaseBalloonSequence = first => openPanelInterval(
    then => releaseBalloon(
      then => closePanelInterval()));

// TIMEOUTS

const sayHello = function() {
    const originalStyle = Elements.mouth.style;
    
    Sounds.hello.play();
    Elements.mouth.style.height += "30px";
  
    setTimeout(function() {
      Elements.mouth.style = originalStyle;
    }, 350);
  }

let index = 90;
function turnHeadWithKeys(event) {
  if (event.key == "ArrowLeft") {
    horizontalTurnTrack[mod(index += 10, 360)]
      .forEach(func => func(Elements.body, 150, Direction.clockwise));
  }

  if (event.key == "ArrowRight") {
    horizontalTurnTrack[mod(index -= 10, 360)]
      .forEach(func => func(Elements.body, 150, Direction.anticlockwise));
  }

}

// SET EVENT HANDLERS

function bind(element, eventTrigger, responseFunc) {
  element.addEventListener(eventTrigger, event => { responseFunc(event); })
}

bind(button1, "click", flashEyesInterval);
bind(button2, "click", raiseArmsInterval);
bind(button3, "click", sayHello);
bind(button4, "click", releaseBalloonSequence);
bind(button5, "click", horizontalTurn(Elements.head, Direction.clockwise, 360, 150));
bind(button6, "click", horizontalTurn(Elements.head, Direction.anticlockwise, 360, 150));
bind(button7, "click", verticalTurn(Elements.head, Direction.up, 360, 150))
bind(button8, "click", horizontalTurn(Elements.body, Direction.clockwise, 360, 150));
bind(button9, "click", duggeeDance);
bind(document, "keydown", turnHeadWithKeys);
