import type { StyleProp, ViewStyle } from "react-native";
import type { IconComponent, IconWeight } from "reicon-react-native/createIcon";
import AddIcon from "reicon-react-native/icons/Add";
import AlertCircleIcon from "reicon-react-native/icons/AlertCircle";
import ArrowLeftIcon from "reicon-react-native/icons/ArrowLeft";
import CalendarIcon from "reicon-react-native/icons/Calendar";
import ChartBarIcon from "reicon-react-native/icons/ChartBar";
import CheckCircleIcon from "reicon-react-native/icons/CheckCircle";
import ChevronDownIcon from "reicon-react-native/icons/ChevronDown";
import ChevronUpIcon from "reicon-react-native/icons/ChevronUp";
import ClipboardIcon from "reicon-react-native/icons/Clipboard";
import CloseCircleIcon from "reicon-react-native/icons/CloseCircle";
import DownloadIcon from "reicon-react-native/icons/Download";
import FolderIcon from "reicon-react-native/icons/Folder";
import GalleryIcon from "reicon-react-native/icons/Gallery";
import GearIcon from "reicon-react-native/icons/Gear";
import ImageIcon from "reicon-react-native/icons/Image";
import MenuIcon from "reicon-react-native/icons/Menu";
import ShareIcon from "reicon-react-native/icons/Share";
import StickerSmileIcon from "reicon-react-native/icons/StickerSmile";
import TagIcon from "reicon-react-native/icons/Tag";
import Trash2Icon from "reicon-react-native/icons/Trash2";

const REICON_COMPONENTS = {
  Add: AddIcon,
  AlertCircle: AlertCircleIcon,
  ArrowLeft: ArrowLeftIcon,
  Calendar: CalendarIcon,
  ChartBar: ChartBarIcon,
  CheckCircle: CheckCircleIcon,
  ChevronDown: ChevronDownIcon,
  ChevronUp: ChevronUpIcon,
  Clipboard: ClipboardIcon,
  CloseCircle: CloseCircleIcon,
  Download: DownloadIcon,
  Folder: FolderIcon,
  Gallery: GalleryIcon,
  Gear: GearIcon,
  Image: ImageIcon,
  Menu: MenuIcon,
  Share: ShareIcon,
  StickerSmile: StickerSmileIcon,
  Tag: TagIcon,
  Trash2: Trash2Icon,
} satisfies Record<string, IconComponent>;

export type ReiconName = keyof typeof REICON_COMPONENTS;

type ReiconIconProps = {
  color: string;
  name: ReiconName;
  size: number;
  style?: StyleProp<ViewStyle>;
  weight?: IconWeight;
};

export function ReiconIcon(props: ReiconIconProps) {
  const { color, name, size, style, weight = "Outline" } = props;
  const Icon = REICON_COMPONENTS[name];

  return <Icon color={color} size={size} style={style} weight={weight} />;
}
