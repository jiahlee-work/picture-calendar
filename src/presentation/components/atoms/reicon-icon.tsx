import type { StyleProp, ViewStyle } from "react-native";
import type { IconComponent, IconWeight } from "reicon-react-native/createIcon";
import AddIcon from "reicon-react-native/icons/Add";
import AlignHCenterIcon from "reicon-react-native/icons/AlignHCenter";
import AlignLeftIcon from "reicon-react-native/icons/AlignLeft";
import AlignRightIcon from "reicon-react-native/icons/AlignRight";
import AlertCircleIcon from "reicon-react-native/icons/AlertCircle";
import AngleRightIcon from "reicon-react-native/icons/AngleRight";
import ArrowRightIcon from "reicon-react-native/icons/ArrowRight";
import BoldIcon from "reicon-react-native/icons/Bold";
import CalendarIcon from "reicon-react-native/icons/Calendar";
import ChartBarIcon from "reicon-react-native/icons/ChartBar";
import CheckIcon from "reicon-react-native/icons/Check";
import ChevronDownIcon from "reicon-react-native/icons/ChevronDown";
import ChevronLeftIcon from "reicon-react-native/icons/ChevronLeft";
import ChevronUpIcon from "reicon-react-native/icons/ChevronUp";
import ClipboardIcon from "reicon-react-native/icons/Clipboard";
import CloseCircleIcon from "reicon-react-native/icons/CloseCircle";
import ColorsSquareIcon from "reicon-react-native/icons/ColorsSquare";
import DownloadIcon from "reicon-react-native/icons/Download";
import FolderIcon from "reicon-react-native/icons/Folder";
import GalleryIcon from "reicon-react-native/icons/Gallery";
import GearIcon from "reicon-react-native/icons/Gear";
import Grid10Icon from "reicon-react-native/icons/Grid10";
import Grid3Icon from "reicon-react-native/icons/Grid3";
import ImageIcon from "reicon-react-native/icons/Image";
import MenuIcon from "reicon-react-native/icons/Menu";
import ShareIcon from "reicon-react-native/icons/Share";
import StarIcon from "reicon-react-native/icons/Star";
import StickerSmileIcon from "reicon-react-native/icons/StickerSmile";
import TagIcon from "reicon-react-native/icons/Tag";
import TextIcon from "reicon-react-native/icons/Text";
import Trash5Icon from "reicon-react-native/icons/Trash5";
import ItalicIcon from "reicon-react-native/icons/Italic";
import UnderlineIcon from "reicon-react-native/icons/Underline";
import Wand3Icon from "reicon-react-native/icons/Wand3";
import Widget6Icon from "reicon-react-native/icons/Widget6";
import XIcon from "reicon-react-native/icons/X";

const REICON_COMPONENTS = {
  Add: AddIcon,
  AlignHCenter: AlignHCenterIcon,
  AlignLeft: AlignLeftIcon,
  AlignRight: AlignRightIcon,
  AlertCircle: AlertCircleIcon,
  ArrowRight: ArrowRightIcon,
  AngleRight: AngleRightIcon,
  Bold: BoldIcon,
  Calendar: CalendarIcon,
  ChartBar: ChartBarIcon,
  Check: CheckIcon,
  ChevronDown: ChevronDownIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronUp: ChevronUpIcon,
  Clipboard: ClipboardIcon,
  CloseCircle: CloseCircleIcon,
  ColorsSquare: ColorsSquareIcon,
  Download: DownloadIcon,
  Folder: FolderIcon,
  Gallery: GalleryIcon,
  Gear: GearIcon,
  Grid10: Grid10Icon,
  Grid3: Grid3Icon,
  Image: ImageIcon,
  Italic: ItalicIcon,
  Menu: MenuIcon,
  Share: ShareIcon,
  Star: StarIcon,
  StickerSmile: StickerSmileIcon,
  Tag: TagIcon,
  Text: TextIcon,
  Trash5: Trash5Icon,
  Underline: UnderlineIcon,
  Wand3: Wand3Icon,
  Widget6: Widget6Icon,
  X: XIcon,
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
