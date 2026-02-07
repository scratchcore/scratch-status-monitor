import { RiGithubFill, RiGlobalLine, RiTwitterXLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface UserCardLinkIconProps {
  label: string;
  href?: string;
  children: React.ReactNode;
}
function UserCardLinkIcon(props: UserCardLinkIconProps) {
  const { label, href, children } = props;
  return (
    <Tooltip>
      <TooltipTrigger>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-foreground/80 transition-colors duration-100"
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface UserCardGroupProps extends React.ComponentProps<"div"> {
  children?: React.ReactNode;
}
export const UserCardGroup = (props: UserCardGroupProps) => {
  const { className, ...rest } = props;
  return <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)} {...rest} />;
};

export interface UserCardProps {
  name: string;
  role: string;
  bio?: string;
  links?: {
    github?: string;
    twitter?: string;
    website?: string;
  };
}
export const UserCard = (props: UserCardProps) => {
  const { name, role, bio, links } = props;

  const sosialLinks = {
    github: links?.github ? `https://github.com/${links.github}` : undefined,
    twitter: links?.twitter ? `https://twitter.com/${links.twitter}` : undefined,
    website: links?.website ? links.website : undefined,
  };

  return (
    <Card className="not-typography relative max-w-60">
      <div className="flex flex-col px-4">
        <div className="flex items-center gap-2">
          <div className="">
            <Avatar size="lg">
              <AvatarImage src={`${sosialLinks.github}.png`} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left truncate">
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {sosialLinks.github && (
            <UserCardLinkIcon label="GitHub" href={sosialLinks.github}>
              <RiGithubFill size={20} />
            </UserCardLinkIcon>
          )}
          {sosialLinks.twitter && (
            <UserCardLinkIcon label="Twitter" href={sosialLinks.twitter}>
              <RiTwitterXLine size={20} />
            </UserCardLinkIcon>
          )}
          {sosialLinks.website && (
            <UserCardLinkIcon label="Website" href={sosialLinks.website}>
              <RiGlobalLine size={20} />
            </UserCardLinkIcon>
          )}
        </div>
        {bio && <div className="mt-4 text-sm">{bio}</div>}
      </div>
    </Card>
  );
};
