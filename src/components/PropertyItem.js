import React from "react";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import MoneyIcon from "@material-ui/icons/AttachMoney";
import DescriptionIcon from "@material-ui/icons/Description";
import grey from "@material-ui/core/colors/grey";

class PropertyItem extends React.Component {
  render() {
    return (
      <GridItem xs={12} sm={6} md={3} style={{ margin: "1em 0" }}>
        <Link
          to={{
            pathname: `/listing/${this.props.id}`,
            state: {
              info: this.props.info
            }
          }}
        >
          <Card className={this.props.classes.card}>
            <CardActionArea>
              <CardMedia
                component="img"
                className={this.props.classes.media}
                height="100%"
                width="100%"
                image={this.props.imagePath}
                title={this.props.address}
                style={this.props.styles.media}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {this.props.address}
                </Typography>
                <Typography component="p" style={{ margin: "1em" }}>
                  <GridContainer justify="flex-start" alignItems="center">
                    <DescriptionIcon color="primary" />
                    {this.props.description}
                  </GridContainer>
                </Typography>

                <Typography component="p" style={{ margin: "1em" }}>
                  <GridContainer justify="flex-start" alignItems="center">
                    <MoneyIcon color="primary" />
                    {this.props.price}
                  </GridContainer>
                </Typography>

                <Typography component="p" style={{ margin: "1em" }}>
                  <GridContainer justify="flex-start" alignItems="center">
                    <MeetingRoomIcon color="primary" />
                    {this.props.rooms}
                  </GridContainer>
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      </GridItem>
    );
  }
}

export { PropertyItem as default };
