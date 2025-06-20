export interface ZoomControlsProps {
  className?: string;
  disabled?: boolean;
}

export interface ZoomState {
  level: number;
  min: number;
  max: number;
} 