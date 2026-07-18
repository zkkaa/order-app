import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
}

export function Field({ label, error, prefix, style, ...props }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-ink-soft mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center bg-surface rounded-2xl border px-4 ${
          error ? 'border-status-belum' : 'border-black/10'
        }`}
      >
        {prefix ? <Text className="text-ink-soft mr-1">{prefix}</Text> : null}
        <TextInput
          className="flex-1 py-3.5 text-base text-ink"
          placeholderTextColor="#A6A9A5"
          {...props}
        />
      </View>
      {error ? <Text className="text-xs text-status-belum mt-1">{error}</Text> : null}
    </View>
  );
}
