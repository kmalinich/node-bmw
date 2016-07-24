#!/usr/bin/perl

# cross-platform example7

my $char       = "";
my $pfound     = 0;
my $t_announce = 0;

# 0x18 = CDC
# 0x50 = MFL
# 0x68 = RAD
# 0xF0 = BMBT
# 0xFF = LOC

my $cdc_announce         = [0x18, 0xFF, 0x02, 0x01];
my $cdc_pollresp         = [0x18, 0xFF, 0x02, 0x00];

my $cdc_statusnotplaying = [0x18, 0x68, 0x39, 0x00, 0x02, 0x00, 0x3F, 0x00, 0x01, 0x01];
my $cdc_statusplaying    = [0x18, 0x68, 0x39, 0x00, 0x09, 0x00, 0x3F, 0x00, 0x01, 0x01];

my $cdc_startplaying01   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x01, 0x00];
my $cdc_startplaying02   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x02, 0x00];
my $cdc_startplaying03   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x03, 0x00];
my $cdc_startplaying04   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x04, 0x00];
my $cdc_startplaying05   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x05, 0x00];
my $cdc_startplaying06   = [0x18, 0x68, 0x39, 0x02, 0x09, 0x00, 0x3F, 0x00, 0x06, 0x00];
my $cdc_endplaying       = [0x18, 0x68, 0x39, 0x07, 0x09, 0x00, 0x3F, 0x00, 0x01, 0x01];

my $cdc_seek1            = [0x18, 0x68, 0x39, 0x08, 0x09, 0x00, 0x3F, 0x00, 0x01, 0x00];
my $cdc_scanfwd          = [0x18, 0x68, 0x39, 0x03, 0x09, 0x00, 0x3F, 0x00, 0x02, 0x03];
my $cdc_scanback         = [0x18, 0x68, 0x39, 0x04, 0x09, 0x00, 0x3F, 0x00, 0x02, 0x03];

my $rad_cdpoll         = [0x68, 0x18, 0x01];
my $rad_cdgetcurrenttk = [0x68, 0x18, 0x38, 0x00, 0x00];
my $rad_cdstopplaying  = [0x68, 0x18, 0x38, 0x01, 0x00];
my $rad_cdreqtoplay    = [0x68, 0x18, 0x38, 0x03, 0x00];
my $rad_cdreqtoplay2   = [0x68, 0x18, 0x38, 0x02, 0x00];

my $mfl_radpushnext    = [0x50, 0x68, 0x3b, 0x01];
my $mfl_radpushprev    = [0x50, 0x68, 0x3b, 0x08];

my $bmbt_radpushnext   = [0xF0, 0x68, 0x48, 0x00];
my $bmbt_radpushprev   = [0xF0, 0x68, 0x48, 0x10];

use strict;
use vars qw( $OS_win $ob $file );

eval "use Device::SerialPort";
die "$@\n" if ($@);

$file = 'tpj4.cfg';

$ob = tie (*FH, 'Device::SerialPort', $file)
   || die "Can't tie: $!\n";


$ob->error_msg(1);		# use built-in error messages
$ob->user_msg(1);

sub lexer {
   my $pattern = shift;

   if ( $pattern->{'code'}[$pattern->{'position'}] == ord($char) )
   {
      # Is it the end of the string pattern ?
      if ($pattern->{'position'}  == $#{$pattern->{'code'}} )
      {
         $pattern->{'position'} = 0;  # reset state
         return 1;
      }
      # The char is matching. Index incrementation.
      $pattern->{'position'} += 1;
   } else  # mismatch
   {
      $pattern->{'position'} = 0;  # reset state
   }
   return 0;
}

sub ClearToSend {
   my $i = 0;
   my $char = "";
   my $rin = "";
   my $nfound = 0;
   my $timeleft = 0;
   my $BlockingFlags = 0;
   my $InBytes = 0;
   my $GrowInBytes = 0;
   my $OutBytes = 0;
   my $ErrorFlags = 0;

   ($BlockingFlags, $InBytes, $OutBytes, $ErrorFlags) = $ob->status;
   for($i=0;$i<2500;$i++)
   {
   }
   ($BlockingFlags, $GrowInBytes, $OutBytes, $ErrorFlags) = $ob->status;
   if ($GrowInBytes > $InBytes)
   {
      print "\nData on the bus... $InBytes\n";
      return 0;
   }
   return 1;
}
     
sub SendCDMsg {
   my $msg = shift;
   my $length = $#{$msg} + 1;
   my $hex = 0;
   my $csum = 0;
   my $pcsum = 0;
   my $i = 0;

   while (1)
   {
      if (ClearToSend())
      {
         for ($i=0;$i<$length;$i++)
         {
            $hex = pack "C", $msg->[$i];
            syswrite FH, $hex, 1, 0;
            $csum ^= $msg->[$i];
         }
         $pcsum = pack "C", $csum;
         syswrite FH, $pcsum, 1, 0;
         return;
      }
      select undef,undef,undef,.5;
   }
}

my $rin = "";
my $nfound = 0;
my $timeleft = 0;
my $playing = 0;

$|++;

SendCDMsg($cd_announce_msg); # Send Announce message

while (1)
{
   vec($rin, fileno(FH), 1) = 1;
   ($nfound, $timeleft) = select($rin, undef, undef, undef);
   if ($nfound)
   {
      $char = getc FH;
      printf("%02.0x ", ord($char));
   }
   if(lexer($rad_cdpoll_msg))
   {
      print "\nPolled by Head Unit\n";
      SendCDMsg($cd_pollresp_msg); # Send Announce message
   }
   if(lexer($rad_cdreqtoplay_msg))
   {
      print "\nRequest to Play\nSending status playing\n";
      SendCDMsg($cd_statusplaying_msg);
      SendCDMsg($cd_startplaying01_msg);
      $playing = 1;
   }
   if(lexer($rad_cdreqtoplay2_msg))
   {
      print "\nRequest to Play2\nSending status playing\n";
      SendCDMsg($cd_startplaying01_msg);
      $playing = 1;
   }
   if(lexer($rad_cdstopplaying_msg))
   {
      print "\nRequest to Stop\nSending status not playing\n";
      SendCDMsg($cd_statusnotplaying_msg);
      $playing = 0;
   }

   if(lexer($rad_cdgetcurrenttk_msg))
   {
      print "\nRequest Current Track\n";
      if($playing)
      {
         print "Sending status playing\n";
         SendCDMsg($cd_startplaying01_msg);
      } else
      {
         print "Sending status not playing\n";
         SendCDMsg($cd_statusnotplaying_msg);
      }
   }

   if(lexer($bmb_radpushnext_msg))
   {
      print "\nNext Song\n";
   }
   if(lexer($bmb_radpushprev_msg))
   {
      print "\nPrev Song\n";
   }

   if(lexer($stw_radpushnext_msg))
   {
      print "\nSteering Wheel Next Song\n";
   }
   if(lexer($stw_radpushprev_msg))
   {
      print "\nSteering Wheel Previous Song\n";
   }
}

undef $ob;
