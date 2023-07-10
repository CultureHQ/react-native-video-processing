import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  NativeModules,
  Dimensions,
  ViewPropTypes,
} from "react-native";
import { msToSec } from "../utils";
import RangeSlider from "rn-range-slider";

const { RNTrimmerManager: TrimmerManager } = NativeModules;
const { width } = Dimensions.get("window");

const RailSelected = () => {
  return (
    <View
      style={{
        height: 50,
        borderRadius: 2,
        // backgroundColor: 'lightgrey'
      }}
    />
  );
};

const Rail = () => {
  return (
    <View
      style={{
        flex: 1,
        height: 50,
        // backgroundColor: "rgba(0,0,0,0.5)",
      }}
    />
  );
};

const Thumb = () => {
  return (
    <View
      style={{
        paddingHorizontal: 4,
        height: 50,
        backgroundColor: "white",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <View
        style={{
          height: 30,
          borderLeftWidth: 1,
          borderLeftColor: "black",
        }}
      />
    </View>
  );
};

export const Trimmer = (props) => {
  const { source } = props;
  const trimmerWidth = props?.width ?? width - 30;
  const trimmerHeight = props?.height ?? 50;
  const [images, setImages] = useState([]);
  const [vidInfo, setVidInfo] = useState(null);
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const handleValueChange = useCallback((low, high) => {
    if (props?.onChange) {
      props?.onChange({
        startTime: low,
        endTime: high,
      });
    }
  }, []);

  useEffect(() => {
    _retriveInfo();
    _retrivePreviewImages();
    return () => {
      setVidInfo(null);
      setImages([]);
    };
  }, []);

  const _retriveInfo = () => {
    TrimmerManager.getVideoInfo(source).then((info) => {
      setVidInfo({
        ...info,
        duration: msToSec(info.duration),
      });
    });
  };

  const _retrivePreviewImages = () => {
    TrimmerManager.getPreviewImages(source)
      .then(({ images }) => {
        setImages(images);
      })
      .catch((e) => console.error(e));
  };

  return vidInfo ? (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {images.map((item, index) => (
        <Image
          key={`preview-source-${item}-${index}`}
          source={{ uri: item }}
          style={{
            width: trimmerWidth / 10,
            height: trimmerHeight,
            resizeMode: "cover",
          }}
        />
      ))}
      <RangeSlider
        style={{ width: trimmerWidth, position: "absolute" }}
        min={0}
        max={vidInfo.duration ? vidInfo.duration * 1000 : 60}
        minRange={10}
        step={1}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        onValueChanged={handleValueChange}
      />
    </View>
  ) : null;
};

Trimmer.propTypes = {
  source: PropTypes.string,
  onChange: PropTypes.func,
  thumbStyle: ViewPropTypes.style,
  thumbDashStyle: ViewPropTypes.style,
  width: PropTypes.number,
  height: PropTypes.number,
};
