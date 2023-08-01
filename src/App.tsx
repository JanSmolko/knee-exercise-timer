import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import "./App.css";

function App() {
  const { request, release } = useWakeLock();
  const [exerciseRepeatTimes, setExerciseRepeatTimes] = useState("30");
  const [exerciseDuration, setExerciseDuration] = useState("10");
  const [exercisePause, setExercisePause] = useState("10");
  const [exerciseCount, setExerciseCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [isExercise, setIsExercise] = useState(false);
  const [time, setTime] = useState(0);
  const [startCounterTime, setStartCounterTime] = useState(Date.now());
  const [isStartedCounterTime, setIsStartedStartCounterTime] = useState(false);
  const audioStart = useMemo(() => new Audio("/start.mp3"), []);
  const audioStop = useMemo(() => new Audio("/stop.mp3"), []);
  const audioFullStop = useMemo(() => new Audio("/fullStop.mp3"), []);

  const start = useCallback(() => {
    audioStart.volume = 1;
    audioStop.volume = 1;
    audioFullStop.volume = 1;
    setIsStarted(true);
    setStartedAt(Date.now());
    setIsExercise(true);
  }, [audioFullStop, audioStart, audioStop]);

  const handleStart = useCallback(async () => {
    try {
      request("screen");
    } catch {
      prompt("uns");
    }

    setIsStartedStartCounterTime(true);
    setStartCounterTime(Date.now());

    // playing all sounds once at the start to get rid of error that sound can be played only on gesture
    audioStart.volume = 0.001;
    audioStart.play();
    audioStop.volume = 0.001;
    audioStop.play();
    audioFullStop.volume = 0.001;
    audioFullStop.play();
  }, [audioFullStop, audioStart, audioStop, request]);

  const stop = useCallback(() => {
    release();

    setIsStartedStartCounterTime(false);
    setIsStarted(false);
    setExerciseCount(0);
    setIsExercise(false);
    setTime(0);
  }, [release]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // timer after clicking start
  useEffect(() => {
    if (!isStartedCounterTime) return;

    const interval = setInterval(() => {
      const secondsElapsed = (Date.now() - startCounterTime) / 1000;
      setTime(Math.abs(3 - secondsElapsed));

      if (secondsElapsed > 3) {
        setIsStartedStartCounterTime(false);
        start();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startCounterTime, isStartedCounterTime, start]);

  // timer for exercise
  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      const secondsElapsed = (Date.now() - startedAt) / 1000;
      setTime(secondsElapsed);

      if (
        secondsElapsed >
        (exerciseCount + 1) * parseInt(exerciseDuration) +
          (exerciseCount + 1) * parseInt(exercisePause)
      ) {
        setExerciseCount((count) => count + 1);
      }

      if (
        secondsElapsed >
          (exerciseCount + 1) * parseInt(exerciseDuration) +
            exerciseCount * parseInt(exercisePause) &&
        secondsElapsed <
          (exerciseCount + 1) * parseInt(exerciseDuration) +
            (exerciseCount + 1) * parseInt(exercisePause)
      ) {
        setIsExercise(false);
      } else {
        setIsExercise(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStarted, startedAt, exerciseCount, exerciseDuration, exercisePause]);

  // timer for playing sounds
  useEffect(() => {
    if (!isStarted) return;
    if (exerciseCount >= parseInt(exerciseRepeatTimes)) {
      audioFullStop.play();
      handleStop();
      return;
    }
    if (isExercise) {
      audioStart.play();
    } else {
      audioStop.play();
    }
  }, [
    isStarted,
    isExercise,
    audioStart,
    audioStop,
    audioFullStop,
    exerciseRepeatTimes,
    exerciseCount,
    handleStop,
  ]);

  return (
    <Box color="white" className="App">
      <Box
        position="relative"
        border="white"
        borderStyle="solid"
        borderRadius=".5rem"
        px={10}
        py={6}
        fontSize="3rem"
        minWidth="200px"
      >
        {time.toFixed(1)}
        <Box
          fontSize="2rem"
          lineHeight="2rem"
          position="absolute"
          bottom="-1rem"
          left="0"
          right="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box background="bg" px=".5rem">
            {exerciseCount}
          </Box>
        </Box>
      </Box>
      <Box className={`App-states`}>
        <Box
          className={`App-engage App-state ${
            isExercise ? "App-state-open" : "App-state-close"
          }`}
        >
          ENGAGE
        </Box>
        <Box
          className={`App-pause App-state ${
            isExercise ? "App-state-close" : "App-state-open"
          }`}
          color="bg"
        >
          PAUSE
        </Box>
      </Box>

      <Stack spacing={3}>
        <FormControl variant="floating">
          <Input
            placeholder="0"
            type="number"
            value={exerciseRepeatTimes}
            onChange={(e) => setExerciseRepeatTimes(e.target.value)}
          />
          <FormLabel>Exercise repeat times</FormLabel>
        </FormControl>
        <FormControl variant="floating">
          <Input
            type="number"
            value={exerciseDuration}
            onChange={(e) => setExerciseDuration(e.target.value)}
          />
          <FormLabel>Exercise duration</FormLabel>
        </FormControl>
        <FormControl variant="floating">
          <Input
            type="number"
            value={exercisePause}
            onChange={(e) => setExercisePause(e.target.value)}
          />
          <FormLabel>Exercise pause</FormLabel>
        </FormControl>
      </Stack>
      <HStack>
        <Button onClick={handleStart} color="green">
          START
        </Button>
        <Button onClick={handleStop} color="red">
          STOP
        </Button>
      </HStack>
    </Box>
  );
}

export default App;
