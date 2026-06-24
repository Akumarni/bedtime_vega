import React from 'react';
import { View, StyleSheet } from 'react-native';
import qrcode from 'qrcode-generator';

interface Props {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

export default function QRCode({
  value,
  size = 200,
  color = '#FFFFFF',
  bgColor = '#000000',
}: Props) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = size / moduleCount;

  const rows = [];
  for (let row = 0; row < moduleCount; row++) {
    const cells = [];
    for (let col = 0; col < moduleCount; col++) {
      cells.push(
        <View
          key={col}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: qr.isDark(row, col) ? color : bgColor,
          }}
        />,
      );
    }
    rows.push(
      <View key={row} style={styles.row}>
        {cells}
      </View>,
    );
  }

  return (
    <View style={[styles.container, { width: size + 16, height: size + 16, backgroundColor: bgColor }]}>
      <View style={{ width: size, height: size }}>
        {rows}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
