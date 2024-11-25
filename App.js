import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, Platform } from 'react-native';
import { Camera } from 'expo-camera'; // Correct import for Camera
import { Video } from 'expo-av'; // Correct import for Video playback
import { shareAsync } from 'expo-sharing'; // For sharing functionality
import * as MediaLibrary from 'expo-media-library'; // Correct import for MediaLibrary
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Gesture Handler Root

export default function App() {
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Requesting permissions...</Text>
      </SafeAreaView>
    );
  } else if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Permission for camera not granted. Please allow camera access in settings.</Text>
      </SafeAreaView>
    );
  }

  const recordVideo = async () => {
    setIsRecording(true);
    const options = {
      quality: "1080p",
      maxDuration: 60,
      mute: false,
    };

    try {
      const recordedVideo = await cameraRef.current.recordAsync(options);
      setVideo(recordedVideo);
    } catch (error) {
      console.error("Error while recording video: ", error);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    setIsRecording(false);
  };

  const handleTouchStart = (e) => {
    console.log("Touch Start", e.nativeEvent);
  };

  const handleTouchEnd = (e) => {
    console.log("Touch End", e.nativeEvent);
  };

  const shareVideo = () => {
    shareAsync(video.uri).then(() => {
      setVideo(null);
    });
  };

  const saveVideo = async () => {
    if (hasMediaLibraryPermission) {
      await MediaLibrary.saveToLibraryAsync(video.uri);
      setVideo(null);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {video ? (
          <>
            <Video
              style={styles.video}
              source={{ uri: video.uri }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <View style={styles.buttonContainer}>
              <Button title="Share" onPress={shareVideo} />
              <Button title="Save" onPress={saveVideo} />
              <Button title="Discard" onPress={() => setVideo(null)} />
            </View>
          </>
        ) : (
          <Camera style={styles.container} ref={cameraRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <View style={styles.buttonContainer}>
              <Button
                title={isRecording ? "Stop Recording" : "Record Video"}
                onPress={isRecording ? stopRecording : recordVideo}
              />
            </View>
          </Camera>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  buttonContainer: {
    backgroundColor: "#fff",
    padding: 10,
    alignSelf: "center",
  },
  video: {
    flex: 1,
    alignSelf: "stretch",
  },
});
